import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { api } from "../../lib/api";
import { Card, SectionHeader } from "../../components/ui/Card";
import Badge from "../../components/ui/Badge";
import EmptyState from "../../components/ui/EmptyState";
import { ServiceGroup } from "../../types";
import { FiBriefcase, FiUsers, FiArrowRight, FiSettings } from "react-icons/fi";

const DashboardService = () => {
  const { user } = useAuth();
  const [serviceGroups, setServiceGroups] = useState<ServiceGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [mySelection, setMySelection] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const groups = await api.getServiceGroups();
        setServiceGroups(groups || []);

        try {
          const selections = await api.getUserSelection();
          setMySelection(selections || []);
        } catch (err) {
          console.log("No selections found");
        }
      } catch (error) {
        console.error("Failed to fetch service groups", error);
      } finally {
        setLoading(false);
      }
    };

    if (user) fetchData();
  }, [user]);

  if (loading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="skeleton h-40 rounded-2xl" />
        ))}
      </div>
    );
  }

  const mySelectionIds = new Set(mySelection.map((s: any) => s.service_group));

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Service Groups"
        description="Join a ministry and serve the fellowship"
        icon={<FiBriefcase className="h-6 w-6" />}
        action={
          <Link to="/dashboard/service/select" className="btn-primary inline-flex items-center gap-2 text-sm">
            <FiSettings className="h-4 w-4" />
            Manage Preferences
          </Link>
        }
      />

      {/* My Selections */}
      {mySelection.length > 0 && (
        <Card className="border-l-4 border-l-accent">
          <h3 className="mb-3 text-lg font-semibold text-foreground">My Selected Groups</h3>
          <div className="flex flex-wrap gap-2">
            {mySelection.map((selection: any) => (
              <Badge key={selection.id} variant="accent" size="md">
                {selection.service_group_name} (Priority {selection.priority})
              </Badge>
            ))}
          </div>
        </Card>
      )}

      {/* Service Groups Grid */}
      {serviceGroups.length === 0 ? (
        <Card>
          <EmptyState
            icon={<FiBriefcase className="h-10 w-10" />}
            title="No service groups available"
            description="Check back later for ministry opportunities."
          />
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {serviceGroups.map((group) => {
            const isSelected = mySelectionIds.has(group.id);

            return (
              <Link key={group.id} to={`/dashboard/service/${group.id}`}>
                <Card hoverable className="group h-full">
                  <div className="flex items-start justify-between">
                    <div className="rounded-xl bg-primary/10 p-3">
                      <FiBriefcase className="h-6 w-6 text-primary" />
                    </div>
                    {isSelected && (
                      <Badge variant="success" size="sm">
                        Selected
                      </Badge>
                    )}
                  </div>
                  <h3 className="mt-4 text-lg font-bold text-foreground">{group.name}</h3>
                  <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
                    {group.description || "No description available"}
                  </p>
                  {group.admin_name && (
                    <div className="mt-3 flex items-center gap-2 text-sm text-muted-foreground">
                      <FiUsers className="h-4 w-4" />
                      <span>Admin: {group.admin_name}</span>
                    </div>
                  )}
                  <div className="mt-4 flex items-center justify-end text-primary">
                    <span className="text-sm font-medium">View Details</span>
                    <FiArrowRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </div>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default DashboardService;
