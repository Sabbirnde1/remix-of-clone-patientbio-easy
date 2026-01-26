import { Linkedin, Twitter, Mail, Pencil, Trash2, Github, Globe, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TeamMember } from "@/hooks/useTeamMembers";

interface TeamMemberCardProps {
  member: TeamMember;
  isEditable?: boolean;
  onEdit?: (member: TeamMember) => void;
  onDelete?: (id: string) => void;
}

const TeamMemberCard = ({ member, isEditable, onEdit, onDelete }: TeamMemberCardProps) => {
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  return (
    <div className="group relative p-4 sm:p-6 rounded-xl sm:rounded-2xl bg-card border border-border/50 hover:border-primary/30 hover:shadow-xl transition-all duration-300 text-center">
      {isEditable && (
        <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => onEdit?.(member)}
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-destructive hover:text-destructive"
            onClick={() => onDelete?.(member.id)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      )}

      {member.profile_image_url ? (
        <img
          src={member.profile_image_url}
          alt={member.name}
          className="w-16 h-16 sm:w-24 sm:h-24 rounded-full object-cover mx-auto mb-3 sm:mb-4 group-hover:scale-110 transition-transform duration-300 ring-2 ring-border"
        />
      ) : (
        <div
          className={`w-16 h-16 sm:w-24 sm:h-24 rounded-full bg-gradient-to-br ${member.gradient || "from-primary to-secondary"} flex items-center justify-center text-white text-lg sm:text-2xl font-bold mx-auto mb-3 sm:mb-4 group-hover:scale-110 transition-transform duration-300`}
        >
          {getInitials(member.name)}
        </div>
      )}

      <h3 className="text-lg sm:text-xl font-semibold mb-1">{member.name}</h3>
      <p className="text-primary font-medium text-xs sm:text-sm mb-2 sm:mb-3">{member.role}</p>
      {member.bio && (
        <p className="text-muted-foreground text-xs sm:text-sm mb-3 sm:mb-4 line-clamp-3">
          {member.bio}
        </p>
      )}

      <div className="flex justify-center flex-wrap gap-2 sm:gap-3">
        {member.linkedin_url && (
          <a
            href={member.linkedin_url}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 rounded-lg bg-muted hover:bg-primary/10 hover:text-primary transition-colors"
            title="LinkedIn"
          >
            <Linkedin className="h-4 w-4" />
          </a>
        )}
        {member.twitter_url && (
          <a
            href={member.twitter_url}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 rounded-lg bg-muted hover:bg-primary/10 hover:text-primary transition-colors"
            title="X (Twitter)"
          >
            <Twitter className="h-4 w-4" />
          </a>
        )}
        {member.github_url && (
          <a
            href={member.github_url}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 rounded-lg bg-muted hover:bg-primary/10 hover:text-primary transition-colors"
            title="GitHub"
          >
            <Github className="h-4 w-4" />
          </a>
        )}
        {member.website_url && (
          <a
            href={member.website_url}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 rounded-lg bg-muted hover:bg-primary/10 hover:text-primary transition-colors"
            title="Website"
          >
            <Globe className="h-4 w-4" />
          </a>
        )}
        {member.email && (
          <a
            href={`mailto:${member.email}`}
            className="p-2 rounded-lg bg-muted hover:bg-primary/10 hover:text-primary transition-colors"
            title="Email"
          >
            <Mail className="h-4 w-4" />
          </a>
        )}
        {member.phone && (
          <a
            href={`tel:${member.phone}`}
            className="p-2 rounded-lg bg-muted hover:bg-primary/10 hover:text-primary transition-colors"
            title="Phone"
          >
            <Phone className="h-4 w-4" />
          </a>
        )}
        {!member.linkedin_url && !member.twitter_url && !member.github_url && !member.website_url && !member.email && !member.phone && (
          <div className="flex gap-2">
            <span className="p-2 rounded-lg bg-muted text-muted-foreground/50">
              <Linkedin className="h-4 w-4" />
            </span>
            <span className="p-2 rounded-lg bg-muted text-muted-foreground/50">
              <Twitter className="h-4 w-4" />
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default TeamMemberCard;
