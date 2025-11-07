import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Bell, X, Check, Archive, Trash2, AlertCircle, Info, CheckCircle, Clock } from "lucide-react";
import { toast } from "sonner";

export function NotificationCenter() {
  const [open, setOpen] = useState(false);

  const { data: unreadData, refetch: refetchCount } = trpc.notifications.getUnreadCount.useQuery();
  const { data: notifications, refetch: refetchNotifications } = trpc.notifications.getNotifications.useQuery({
    limit: 10,
    offset: 0,
  });

  const markAsReadMutation = trpc.notifications.markAsRead.useMutation({
    onSuccess: () => {
      refetchCount();
      refetchNotifications();
    },
  });

  const markAllAsReadMutation = trpc.notifications.markAllAsRead.useMutation({
    onSuccess: () => {
      refetchCount();
      refetchNotifications();
      toast.success("All notifications marked as read");
    },
  });

  const archiveMutation = trpc.notifications.archive.useMutation({
    onSuccess: () => {
      refetchNotifications();
      toast.success("Notification archived");
    },
  });

  const deleteMutation = trpc.notifications.delete.useMutation({
    onSuccess: () => {
      refetchNotifications();
      toast.success("Notification deleted");
    },
  });

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "CASE_APPROVED":
      case "PROFILE_PUBLISHED":
      case "PROFILE_UPDATE_APPROVED":
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "CASE_REJECTED":
      case "PROFILE_UPDATE_REJECTED":
        return <AlertCircle className="h-4 w-4 text-red-600" />;
      case "ADMIN_ALERT":
        return <AlertCircle className="h-4 w-4 text-orange-600" />;
      case "MESSAGE_RECEIVED":
        return <Bell className="h-4 w-4 text-blue-600" />;
      default:
        return <Info className="h-4 w-4 text-gray-600" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "URGENT":
        return "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-200";
      case "HIGH":
        return "bg-orange-100 text-orange-800 dark:bg-orange-950 dark:text-orange-200";
      case "NORMAL":
        return "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-200";
      case "LOW":
        return "bg-gray-100 text-gray-800 dark:bg-gray-950 dark:text-gray-200";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-950 dark:text-gray-200";
    }
  };

  const unreadCount = unreadData?.count || 0;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-96 p-0" align="end">
        <Card className="border-0">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Notifications</CardTitle>
              {unreadCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => markAllAsReadMutation.mutate()}
                  disabled={markAllAsReadMutation.isPending}
                >
                  <Check className="h-4 w-4 mr-1" />
                  Mark all as read
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-2 max-h-96 overflow-y-auto">
            {!notifications || notifications.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>No notifications yet</p>
              </div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-3 rounded-lg border transition-colors ${
                    notification.isRead
                      ? "bg-background border-border"
                      : "bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-900"
                  }`}
                >
                  <div className="flex gap-3">
                    <div className="mt-1">
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <p className="font-semibold text-sm line-clamp-1">
                            {notification.title}
                          </p>
                          <p className="text-xs text-muted-foreground line-clamp-2">
                            {notification.message}
                          </p>
                        </div>
                        <Badge className={getPriorityColor(notification.priority)}>
                          {notification.priority}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-xs text-muted-foreground">
                          {new Date(notification.createdAt).toLocaleDateString()}
                        </span>
                        <div className="flex gap-1 ml-auto">
                          {!notification.isRead && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                markAsReadMutation.mutate({ notificationId: notification.id })
                              }
                              disabled={markAsReadMutation.isPending}
                            >
                              <Check className="h-3 w-3" />
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              archiveMutation.mutate({ notificationId: notification.id })
                            }
                            disabled={archiveMutation.isPending}
                          >
                            <Archive className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              deleteMutation.mutate({ notificationId: notification.id })
                            }
                            disabled={deleteMutation.isPending}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </PopoverContent>
    </Popover>
  );
}
