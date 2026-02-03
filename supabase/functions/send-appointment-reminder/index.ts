import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface AppointmentReminder {
  id: string;
  appointment_id: string;
  reminder_type: "email" | "sms";
  hours_before: number;
  scheduled_for: string;
}

interface AppointmentDetails {
  id: string;
  appointment_date: string;
  start_time: string;
  reason: string | null;
  patient_id: string;
  doctor_id: string;
  hospital_id: string | null;
  patient_profile: {
    display_name: string | null;
    phone: string | null;
  } | null;
  doctor_profile: {
    full_name: string;
  } | null;
  hospital: {
    name: string;
  } | null;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    const twilioAccountSid = Deno.env.get("TWILIO_ACCOUNT_SID");
    const twilioAuthToken = Deno.env.get("TWILIO_AUTH_TOKEN");
    const twilioPhoneNumber = Deno.env.get("TWILIO_PHONE_NUMBER");

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get pending reminders that are due
    const now = new Date().toISOString();
    const { data: pendingReminders, error: remindersError } = await supabase
      .from("appointment_reminders")
      .select("*")
      .eq("status", "pending")
      .lte("scheduled_for", now)
      .limit(50);

    if (remindersError) {
      throw new Error(`Failed to fetch reminders: ${remindersError.message}`);
    }

    if (!pendingReminders || pendingReminders.length === 0) {
      return new Response(
        JSON.stringify({ message: "No pending reminders to send" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const results = {
      processed: 0,
      sent: 0,
      failed: 0,
      skipped: 0,
      errors: [] as string[],
    };

    for (const reminder of pendingReminders as AppointmentReminder[]) {
      results.processed++;

      // Get appointment details
      const { data: appointment, error: apptError } = await supabase
        .from("appointments")
        .select(`
          id,
          appointment_date,
          start_time,
          reason,
          patient_id,
          doctor_id,
          hospital_id,
          patient_profile:user_profiles!appointments_patient_id_fkey(display_name, phone),
          doctor_profile:doctor_profiles!appointments_doctor_id_fkey(full_name),
          hospital:hospitals(name)
        `)
        .eq("id", reminder.appointment_id)
        .single();

      if (apptError || !appointment) {
        await supabase
          .from("appointment_reminders")
          .update({ status: "failed", error_message: "Appointment not found" })
          .eq("id", reminder.id);
        results.failed++;
        continue;
      }

      const appt = appointment as unknown as AppointmentDetails;

      // Check if appointment is cancelled
      const { data: apptStatus } = await supabase
        .from("appointments")
        .select("status")
        .eq("id", reminder.appointment_id)
        .single();

      if (apptStatus?.status === "cancelled") {
        await supabase
          .from("appointment_reminders")
          .update({ status: "cancelled", error_message: "Appointment was cancelled" })
          .eq("id", reminder.id);
        results.skipped++;
        continue;
      }

      // Get patient email from auth
      const { data: authUser } = await supabase.auth.admin.getUserById(appt.patient_id);
      const patientEmail = authUser?.user?.email;
      const patientPhone = appt.patient_profile?.phone;
      const patientName = appt.patient_profile?.display_name || "Patient";
      const doctorName = appt.doctor_profile?.full_name || "Doctor";
      const hospitalName = appt.hospital?.name || "";

      // Format appointment time
      const appointmentDate = new Date(`${appt.appointment_date}T${appt.start_time}`);
      const formattedDate = appointmentDate.toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      });
      const formattedTime = appointmentDate.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      });

      try {
        if (reminder.reminder_type === "email" && resendApiKey && patientEmail) {
          // Send email via Resend
          const emailResponse = await fetch("https://api.resend.com/emails", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${resendApiKey}`,
            },
            body: JSON.stringify({
              from: "Health Records <noreply@resend.dev>",
              to: patientEmail,
              subject: `Appointment Reminder: ${formattedDate} at ${formattedTime}`,
              html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                  <h2 style="color: #2563eb;">Appointment Reminder</h2>
                  <p>Hello ${patientName},</p>
                  <p>This is a reminder for your upcoming appointment:</p>
                  <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
                    <p><strong>Date:</strong> ${formattedDate}</p>
                    <p><strong>Time:</strong> ${formattedTime}</p>
                    <p><strong>Doctor:</strong> Dr. ${doctorName}</p>
                    ${hospitalName ? `<p><strong>Location:</strong> ${hospitalName}</p>` : ""}
                    ${appt.reason ? `<p><strong>Reason:</strong> ${appt.reason}</p>` : ""}
                  </div>
                  <p>Please arrive 10-15 minutes early to complete any necessary paperwork.</p>
                  <p>If you need to reschedule or cancel, please do so at least 24 hours in advance.</p>
                  <p>Best regards,<br>Health Records Team</p>
                </div>
              `,
            }),
          });

          if (!emailResponse.ok) {
            const errorText = await emailResponse.text();
            throw new Error(`Resend API error: ${errorText}`);
          }

          await supabase
            .from("appointment_reminders")
            .update({ status: "sent", sent_at: new Date().toISOString() })
            .eq("id", reminder.id);
          results.sent++;

        } else if (reminder.reminder_type === "sms" && twilioAccountSid && twilioAuthToken && twilioPhoneNumber && patientPhone) {
          // Send SMS via Twilio
          const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${twilioAccountSid}/Messages.json`;
          const message = `Reminder: Appointment with Dr. ${doctorName} on ${formattedDate} at ${formattedTime}${hospitalName ? ` at ${hospitalName}` : ""}. Please arrive 10-15 min early.`;

          const smsResponse = await fetch(twilioUrl, {
            method: "POST",
            headers: {
              "Content-Type": "application/x-www-form-urlencoded",
              Authorization: `Basic ${btoa(`${twilioAccountSid}:${twilioAuthToken}`)}`,
            },
            body: new URLSearchParams({
              From: twilioPhoneNumber,
              To: patientPhone,
              Body: message,
            }),
          });

          if (!smsResponse.ok) {
            const errorText = await smsResponse.text();
            throw new Error(`Twilio API error: ${errorText}`);
          }

          await supabase
            .from("appointment_reminders")
            .update({ status: "sent", sent_at: new Date().toISOString() })
            .eq("id", reminder.id);
          results.sent++;

        } else {
          // Missing credentials or contact info
          const reason = reminder.reminder_type === "email" 
            ? (!resendApiKey ? "RESEND_API_KEY not configured" : "No patient email")
            : (!twilioAccountSid ? "Twilio not configured" : "No patient phone");
          
          await supabase
            .from("appointment_reminders")
            .update({ status: "failed", error_message: reason })
            .eq("id", reminder.id);
          results.skipped++;
        }
      } catch (sendError) {
        const errorMessage = sendError instanceof Error ? sendError.message : "Unknown error";
        await supabase
          .from("appointment_reminders")
          .update({ status: "failed", error_message: errorMessage })
          .eq("id", reminder.id);
        results.failed++;
        results.errors.push(errorMessage);
      }
    }

    return new Response(
      JSON.stringify({ success: true, results }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error processing reminders:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
