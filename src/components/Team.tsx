import { useState } from "react";
import { Plus, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useIsAdmin } from "@/hooks/useUserRole";
import {
  useTeamMembers,
  useCreateTeamMember,
  useUpdateTeamMember,
  useDeleteTeamMember,
  uploadProfileImage,
  TeamMember,
  TeamMemberInsert,
} from "@/hooks/useTeamMembers";
import TeamMemberCard from "@/components/TeamMemberCard";
import TeamMemberForm from "@/components/TeamMemberForm";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const Team = () => {
  const { user } = useAuth();
  const { isAdmin } = useIsAdmin();
  const { data: teamMembers, isLoading } = useTeamMembers(false);
  const { data: advisors } = useTeamMembers(true);

  const createMember = useCreateTeamMember();
  const updateMember = useUpdateTeamMember();
  const deleteMember = useDeleteTeamMember();

  const [formOpen, setFormOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [memberToDelete, setMemberToDelete] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleEdit = (member: TeamMember) => {
    setEditingMember(member);
    setFormOpen(true);
  };

  const handleDelete = (id: string) => {
    setMemberToDelete(id);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (memberToDelete) {
      await deleteMember.mutateAsync(memberToDelete);
      setDeleteDialogOpen(false);
      setMemberToDelete(null);
    }
  };

  const handleSubmit = async (data: TeamMemberInsert, imageFile?: File) => {
    setIsSubmitting(true);
    try {
      let profileImageUrl = data.profile_image_url;

      if (imageFile) {
        const tempId = editingMember?.id || crypto.randomUUID();
        profileImageUrl = await uploadProfileImage(imageFile, tempId);
      }

      if (editingMember) {
        await updateMember.mutateAsync({
          id: editingMember.id,
          updates: { ...data, profile_image_url: profileImageUrl },
        });
      } else {
        await createMember.mutateAsync({ ...data, profile_image_url: profileImageUrl });
      }

      setEditingMember(null);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenForm = () => {
    setEditingMember(null);
    setFormOpen(true);
  };

  return (
    <section id="team" className="py-16 sm:py-24">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-16">
          <span className="inline-flex items-center px-3 sm:px-4 py-2 rounded-full bg-accent/10 text-accent text-xs sm:text-sm font-medium mb-4 sm:mb-6">
            👥 Our Team
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 sm:mb-6 px-2">
            Meet the people building the{" "}
            <span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
              future of health
            </span>
          </h2>
          <p className="text-base sm:text-lg text-muted-foreground px-2">
            Our diverse team of healthcare experts, engineers, and innovators is united by a single
            mission: putting patients in control of their health data.
          </p>
        </div>

        {/* Add Team Member Button (only visible to admin users) */}
        {isAdmin && (
          <div className="flex justify-center mb-8">
            <Button onClick={handleOpenForm} className="gap-2">
              <Plus className="h-4 w-4" />
              Add Team Member
            </Button>
          </div>
        )}

        {/* Loading State */}
        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <>
            {/* Leadership Team */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-8 mb-10 sm:mb-16">
              {teamMembers?.map((member) => (
                <TeamMemberCard
                  key={member.id}
                  member={member}
                  isEditable={isAdmin}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                />
              ))}
            </div>

            {/* Advisors */}
            {advisors && advisors.length > 0 && (
              <div className="bg-muted/30 rounded-xl sm:rounded-2xl p-5 sm:p-8">
                <h3 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 text-center">
                  Advisory Board
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                  {advisors.map((advisor) => (
                    <div key={advisor.id} className="text-center group relative">
                      {isAdmin && (
                        <div className="absolute top-0 right-0 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() => handleEdit(advisor)}
                          >
                            <span className="text-xs">✏️</span>
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() => handleDelete(advisor.id)}
                          >
                            <span className="text-xs">🗑️</span>
                          </Button>
                        </div>
                      )}
                      {advisor.profile_image_url ? (
                        <img
                          src={advisor.profile_image_url}
                          alt={advisor.name}
                          className="w-12 h-12 sm:w-16 sm:h-16 rounded-full object-cover mx-auto mb-2 sm:mb-3 ring-2 ring-border"
                        />
                      ) : (
                        <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-gradient-to-br from-muted-foreground/20 to-muted-foreground/10 flex items-center justify-center text-muted-foreground text-sm sm:text-lg font-bold mx-auto mb-2 sm:mb-3">
                          {advisor.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </div>
                      )}
                      <h4 className="font-semibold text-sm sm:text-base">{advisor.name}</h4>
                      <p className="text-xs sm:text-sm text-muted-foreground">{advisor.role}</p>
                      {(advisor.linkedin_url || advisor.twitter_url) && (
                        <div className="flex justify-center gap-2 mt-2">
                          {advisor.linkedin_url && (
                            <a
                              href={advisor.linkedin_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-muted-foreground hover:text-primary transition-colors"
                            >
                              <span className="text-xs">in</span>
                            </a>
                          )}
                          {advisor.twitter_url && (
                            <a
                              href={advisor.twitter_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-muted-foreground hover:text-primary transition-colors"
                            >
                              <span className="text-xs">𝕏</span>
                            </a>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Team Member Form Dialog */}
      <TeamMemberForm
        open={formOpen}
        onOpenChange={setFormOpen}
        member={editingMember}
        onSubmit={handleSubmit}
        isLoading={isSubmitting}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Team Member</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove this team member? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </section>
  );
};

export default Team;
