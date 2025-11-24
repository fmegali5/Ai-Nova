import { Check, CheckCheck } from "lucide-react";

function ReadReceipts({ message, isOwn }) {
  if (!isOwn) return null;

  return (
    <div className="flex items-center gap-1 text-xs mt-1">
      <span className="text-slate-500">
        {new Date(message.createdAt).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        })}
      </span>
      {message.read ? (
        <CheckCheck size={14} className="text-cyan-400" />
      ) : (
        <Check size={14} className="text-slate-500" />
      )}
    </div>
  );
}

export default ReadReceipts;
