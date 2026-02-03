import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { PageSkeleton, CardSkeleton } from "@/components/ui/page-skeleton";
import { InlineEmptyState } from "@/components/ui/empty-state";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Share2, Copy, Check, ExternalLink, Link2, Clock, Trash2, XCircle, Plus, Loader2, UserPlus, Eye, BarChart3, Activity } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { QRCodeSVG } from "qrcode.react";
import { Link } from "react-router-dom";
import { useAccessTokens, AccessToken } from "@/hooks/useAccessTokens";
import { useDoctorConnections } from "@/hooks/useDoctorConnections";
import ShareWithDoctorDialog from "@/components/dashboard/ShareWithDoctorDialog";
import { format, formatDistanceToNow } from "date-fns";

const EXPIRY_OPTIONS = [
  { value: "1", label: "1 hour" },
  { value: "24", label: "24 hours" },
  { value: "168", label: "7 days" },
  { value: "720", label: "30 days" },
];

const ShareDataPage = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { tokens, isLoading, createToken, isCreating, revokeToken, deleteToken, isTokenActive, isTokenExpired } = useAccessTokens();
  const { doctors, isLoading: doctorsLoading } = useDoctorConnections();

  const [copied, setCopied] = useState(false);
  const [copiedToken, setCopiedToken] = useState<string | null>(null);
  const [expiryHours, setExpiryHours] = useState("24");
  const [linkLabel, setLinkLabel] = useState("");

  // Generate patient ID from user UUID
  const patientId = user?.id?.substring(0, 8).toUpperCase() || "N/A";
  const qrValue = `patientbio:${patientId}`;

  const handleCopyId = async () => {
    try {
      await navigator.clipboard.writeText(patientId);
      setCopied(true);
      toast({ title: "Copied!", description: "Patient ID copied to clipboard." });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast({ title: "Failed to copy", description: "Please copy the ID manually.", variant: "destructive" });
    }
  };

  const handleCopyLink = async (token: string) => {
    const shareUrl = `${window.location.origin}/share/${token}`;
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopiedToken(token);
      toast({ title: "Link Copied!", description: "Share link copied to clipboard." });
      setTimeout(() => setCopiedToken(null), 2000);
    } catch {
      toast({ title: "Failed to copy", description: "Please copy the link manually.", variant: "destructive" });
    }
  };

  const handleCreateLink = () => {
    createToken({
      expiresInHours: parseInt(expiryHours),
      label: linkLabel.trim() || undefined,
    });
    setLinkLabel("");
  };

  const getTokenStatus = (token: AccessToken) => {
    if (token.is_revoked) return { label: "Revoked", variant: "destructive" as const };
    if (isTokenExpired(token)) return { label: "Expired", variant: "secondary" as const };
    return { label: "Active", variant: "default" as const };
  };

  const activeTokens = tokens.filter(isTokenActive);

  // Analytics calculations
  const totalViews = tokens.reduce((sum, t) => sum + (t.access_count || 0), 0);
  const viewedTokens = tokens.filter(t => t.access_count > 0);
  const recentlyAccessed = tokens
    .filter(t => t.accessed_at)
    .sort((a, b) => new Date(b.accessed_at!).getTime() - new Date(a.accessed_at!).getTime())
    .slice(0, 3);

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Patient ID & QR Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Share2 className="h-5 w-5 text-primary" />
            Share Your Data
          </CardTitle>
          <CardDescription>
            Share your health records securely with healthcare providers
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Patient ID Section */}
          <div className="bg-gradient-to-br from-primary/10 via-secondary/5 to-transparent rounded-xl p-6 text-center">
            <p className="text-sm text-muted-foreground mb-2">Your Patient ID</p>
            <div className="flex items-center justify-center gap-3">
              <span className="text-3xl font-mono font-bold tracking-wider">{patientId}</span>
              <Button variant="outline" size="icon" onClick={handleCopyId} className="h-8 w-8">
                {copied ? <Check className="h-4 w-4 text-primary" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-2">Share this ID with your healthcare provider</p>
          </div>

          {/* QR Code Section */}
          <div className="border border-border rounded-xl p-6 text-center">
            <div className="w-32 h-32 bg-white rounded-lg flex items-center justify-center mx-auto mb-4 p-2 shadow-sm">
              <QRCodeSVG value={qrValue} size={112} level="H" bgColor="#ffffff" fgColor="#1f2937" />
            </div>
            <h3 className="font-semibold mb-2">QR Code Sharing</h3>
            <p className="text-sm text-muted-foreground mb-4">Scan to share your patient info instantly</p>
            <Button variant="outline" size="sm" asChild>
              <Link to="/dashboard/qr-code">
                <ExternalLink className="mr-2 h-4 w-4" />
                View Full Size
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Access Analytics Section */}
      {tokens.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <BarChart3 className="h-5 w-5 text-primary" />
              Access Analytics
            </CardTitle>
            <CardDescription>
              See when and how often your shared data was viewed
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Stats Summary */}
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-muted/50 rounded-lg p-3 text-center">
                <div className="flex items-center justify-center gap-1.5 text-2xl font-bold text-primary">
                  <Eye className="h-5 w-5" />
                  {totalViews}
                </div>
                <p className="text-xs text-muted-foreground mt-1">Total Views</p>
              </div>
              <div className="bg-muted/50 rounded-lg p-3 text-center">
                <div className="text-2xl font-bold text-primary">{activeTokens.length}</div>
                <p className="text-xs text-muted-foreground mt-1">Active Links</p>
              </div>
              <div className="bg-muted/50 rounded-lg p-3 text-center">
                <div className="text-2xl font-bold text-primary">{viewedTokens.length}</div>
                <p className="text-xs text-muted-foreground mt-1">Links Viewed</p>
              </div>
            </div>

            {/* Recent Activity */}
            {recentlyAccessed.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-sm font-medium flex items-center gap-2">
                  <Activity className="h-4 w-4 text-muted-foreground" />
                  Recent Activity
                </h4>
                <div className="space-y-2">
                  {recentlyAccessed.map((token) => (
                    <div
                      key={token.id}
                      className="flex items-center justify-between bg-muted/30 rounded-md p-2.5 text-sm"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <Eye className="h-4 w-4 text-primary shrink-0" />
                        <span className="font-medium truncate">
                          {token.label || "Access Link"}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground shrink-0">
                        <span className="hidden sm:inline">
                          {format(new Date(token.accessed_at!), "MMM d, h:mm a")}
                        </span>
                        <span className="sm:hidden">
                          {formatDistanceToNow(new Date(token.accessed_at!), { addSuffix: true })}
                        </span>
                        <Badge variant="secondary" className="text-xs">
                          {token.access_count}x
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {totalViews === 0 && (
              <p className="text-sm text-muted-foreground text-center py-2">
                No one has viewed your shared links yet. Share a link to see analytics here.
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Time-Limited Access Links */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Link2 className="h-5 w-5 text-primary" />
            Time-Limited Access Links
          </CardTitle>
          <CardDescription>
            Create secure links that expire after a set time period
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Share with Doctor Button */}
          <ShareWithDoctorDialog doctors={doctors} doctorsLoading={doctorsLoading} />
          {/* Create New Link Form */}
          <div className="bg-muted/50 rounded-xl p-4 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="link-label">Label (optional)</Label>
                <Input
                  id="link-label"
                  placeholder="e.g., For Dr. Smith"
                  value={linkLabel}
                  onChange={(e) => setLinkLabel(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="expiry">Expires in</Label>
                <Select value={expiryHours} onValueChange={setExpiryHours}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {EXPIRY_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <Button
              onClick={handleCreateLink}
              disabled={isCreating}
              className="w-full bg-gradient-to-r from-primary to-secondary border-0"
            >
              {isCreating ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Creating...</>
              ) : (
                <><Plus className="mr-2 h-4 w-4" /> Create Access Link</>
              )}
            </Button>
          </div>

          {/* Active Links Summary */}
          {activeTokens.length > 0 && (
            <div className="text-sm text-muted-foreground">
              {activeTokens.length} active link{activeTokens.length !== 1 && "s"}
            </div>
          )}

          {/* Links List */}
          {isLoading ? (
            <div className="space-y-3">
              <CardSkeleton />
              <CardSkeleton />
            </div>
          ) : tokens.length === 0 ? (
            <InlineEmptyState
              icon={Link2}
              title="No access links yet"
              description="Create a time-limited link above to share your health data with a healthcare provider."
              action={{
                label: "Create Access Link",
                onClick: handleCreateLink,
                icon: Plus
              }}
            />
          ) : (
            <div className="space-y-3">
              {tokens.map((token) => {
                const status = getTokenStatus(token);
                const isActive = isTokenActive(token);
                return (
                  <div
                    key={token.id}
                    className={`border rounded-lg p-3 sm:p-4 ${isActive ? "border-border" : "border-border/50 opacity-60"}`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <span className="font-medium truncate">
                            {token.label || "Access Link"}
                          </span>
                          <Badge variant={status.variant} className="text-xs shrink-0">
                            {status.label}
                          </Badge>
                        </div>
                        <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {isActive
                              ? `Expires ${formatDistanceToNow(new Date(token.expires_at), { addSuffix: true })}`
                              : `Expired ${format(new Date(token.expires_at), "MMM d, yyyy")}`}
                          </span>
                          {token.access_count > 0 && (
                            <span className="flex items-center gap-1">
                              <Eye className="h-3 w-3" />
                              {token.access_count}x
                            </span>
                          )}
                          {token.accessed_at && (
                            <span className="hidden sm:inline text-muted-foreground/70">
                              Last: {formatDistanceToNow(new Date(token.accessed_at), { addSuffix: true })}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-1 self-end sm:self-start shrink-0">
                        {isActive && (
                          <>
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => handleCopyLink(token.token)}
                            >
                              {copiedToken === token.token ? (
                                <Check className="h-4 w-4 text-primary" />
                              ) : (
                                <Copy className="h-4 w-4" />
                              )}
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="outline" size="icon" className="h-8 w-8">
                                  <XCircle className="h-4 w-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Revoke Access Link</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    This will immediately deactivate the link. Anyone with this link will no longer be able to access your data.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction onClick={() => revokeToken(token.id)}>
                                    Revoke
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </>
                        )}
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-8 w-8 text-destructive hover:bg-destructive hover:text-destructive-foreground"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Access Link</AlertDialogTitle>
                              <AlertDialogDescription>
                                This will permanently delete this link from your history. This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                onClick={() => deleteToken(token.id)}
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <p className="text-xs text-center text-muted-foreground">
            Links grant temporary read-only access to your health profile and records.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default ShareDataPage;
