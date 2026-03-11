import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { api } from "../../lib/api";
import { Card, SectionHeader } from "../../components/ui/Card";
import { Avatar, AvatarGroup } from "../../components/ui/Avatar";
import Badge from "../../components/ui/Badge";
import EmptyState from "../../components/ui/EmptyState";
import { Users, Phone, Mail, User } from "react-icons/fi";

const DashboardFamily = () => {
  const { user } = useAuth();
  const [family, setFamily] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchFamily = async () => {
      try {
        const data = await api.getMyFamily();
        setFamily(data);
      } catch (err: any) {
        setFamily(null);
        setError(
          err?.response?.status === 404
            ? "You have not been assigned a family yet."
            : "Could not load family information."
        );
      } finally {
        setLoading(false);
      }
    };

    if (user) fetchFamily();
  }, [user]);

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="skeleton h-24 rounded-2xl" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <SectionHeader
        title="My Family"
        description="Your spiritual family and mentors"
        icon={<Users className="h-6 w-6" />}
      />

      {error ? (
        <Card>
          <EmptyState
            icon={<Users className="h-10 w-10" />}
            title="No family assigned"
            description={error}
          />
        </Card>
      ) : !family ? (
        <Card>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="skeleton h-20 rounded-xl" />
            ))}
          </div>
        </Card>
      ) : (
        <>
          {/* Parents/Mentors */}
          <div className="grid gap-4 md:grid-cols-2">
            {[
              { label: "Spiritual Father", data: family.father, role: "Father" },
              { label: "Spiritual Mother", data: family.mother, role: "Mother" },
            ].map((parent) => (
              <Card key={parent.label} className="border-l-4 border-l-primary">
                <div className="flex items-start gap-4">
                  <Avatar src={null} alt={parent.data?.name || "?"} size="lg" />
                  <div className="flex-1">
                    <Badge variant="primary" size="sm" className="mb-2">
                      {parent.role}
                    </Badge>
                    <h3 className="text-lg font-bold text-foreground">
                      {parent.data?.name || "—"}
                    </h3>
                    {parent.data?.email && (
                      <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
                        <Mail className="h-4 w-4" />
                        <span>{parent.data.email}</span>
                      </div>
                    )}
                    {parent.data?.profile?.personal_phone && (
                      <div className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
                        <Phone className="h-4 w-4" />
                        <span>{parent.data.profile.personal_phone}</span>
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {/* Siblings */}
          {family.siblings && family.siblings.length > 0 && (
            <Card>
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-foreground">
                  Siblings ({family.siblings.length})
                </h3>
                <AvatarGroup
                  avatars={family.siblings.slice(0, 5).map((sib: any) => ({
                    src: null,
                    alt: sib.name || "?",
                  }))}
                  max={5}
                  size="sm"
                />
              </div>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {family.siblings.map((sibling: any, index: number) => (
                  <div
                    key={sibling.id || index}
                    className="flex items-center gap-3 rounded-xl bg-muted/50 p-3 transition hover:bg-muted"
                  >
                    <Avatar src={null} alt={sibling.name || "?"} size="md" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium text-foreground">{sibling.name}</p>
                      <p className="truncate text-sm text-muted-foreground">
                        {sibling.profile?.department || "Student"}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Religious Father (if exists) */}
          {family.religious_father && (
            <Card className="border-l-4 border-l-accent">
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-accent/10 p-3">
                  <User className="h-6 w-6 text-accent-foreground" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Religious Father</p>
                  <p className="text-lg font-bold text-foreground">{family.religious_father}</p>
                </div>
              </div>
            </Card>
          )}
        </>
      )}
    </div>
  );
};

export default DashboardFamily;
