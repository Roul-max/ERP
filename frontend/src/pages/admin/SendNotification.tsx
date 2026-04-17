import React, { useMemo } from "react";
import { useForm } from "react-hook-form";
import { Send } from "lucide-react";
import client from "../../api/client";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import Input from "../../components/ui/Input";
import Select from "../../components/ui/Select";
import Textarea from "../../components/ui/Textarea";
import { toastError, toastSuccess } from "../../utils/toast";

type FormValues = {
  title: string;
  message: string;
  type: "info" | "success" | "warning" | "error";
  channel: "inApp" | "email";
  audience: "all" | "admin" | "faculty" | "student";
};

const SendNotification: React.FC = () => {
  const { register, handleSubmit, reset, formState } = useForm<FormValues>({
    defaultValues: {
      type: "info",
      channel: "inApp",
      audience: "all",
    },
  });

  const roles = useMemo(() => {
    // backend expects roles[] or empty for all
    return (audience: FormValues["audience"]) => {
      if (audience === "all") return [];
      return [audience];
    };
  }, []);

  const onSubmit = async (data: any) => {
    try {
      await client.post("/notifications", {
        title: data.title,
        message: data.message,
        type: data.type,
        channel: data.channel,
        roles: roles(data.audience),
      });
      toastSuccess(
        data.channel === "email"
          ? "Email broadcast queued (simulation)"
          : "Broadcast sent"
      );
      reset();
    } catch (error) {
      toastError((error as any)?.response?.data?.message || "Failed to send");
    }
  };

  return (
    <Card className="p-6">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Select label="Channel" {...register("channel", { required: true })}>
              <option value="inApp">In-app notification</option>
              <option value="email">Email (simulation)</option>
            </Select>
            <Select label="Audience" {...register("audience", { required: true })}>
              <option value="all">All active users</option>
              <option value="admin">Admins only</option>
              <option value="faculty">Faculty only</option>
              <option value="student">Students only</option>
            </Select>
          </div>

          <Input
            label="Title"
            placeholder="Important announcement"
            {...register("title", { required: true })}
          />

          <Textarea
            label="Message"
            placeholder="Write your message…"
            rows={5}
            {...register("message", { required: true })}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Select label="Type" {...register("type", { required: true })}>
              <option value="info">Info</option>
              <option value="success">Success</option>
              <option value="warning">Warning</option>
              <option value="error">Error</option>
            </Select>
            <div className="flex items-end">
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Tip: Use short titles and one clear action in the message.
              </p>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-200/60 dark:border-slate-800/60 flex justify-end">
            <Button
              type="submit"
              leftIcon={<Send size={18} />}
              disabled={formState.isSubmitting}
            >
              Send broadcast
            </Button>
          </div>
        </form>
    </Card>
  );
};

export default SendNotification;
