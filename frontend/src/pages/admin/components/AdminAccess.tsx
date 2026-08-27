import { axiosInstance } from "@/lib/axios";
import { getErrorMessage } from "@/lib/utils";
import { UserPlus, UserRoundMinus } from "lucide-react";
import { FormEvent, useState } from "react";
import toast from "react-hot-toast";

const AdminAccess = () => {
	const [email, setEmail] = useState("");
	const [isSubmitting, setIsSubmitting] = useState(false);

	const updateAdminAccess = async (event: FormEvent, action: "grant" | "revoke") => {
		event.preventDefault();
		setIsSubmitting(true);
		try {
			if (action === "grant") await axiosInstance.post("/admin/admins", { email });
			else await axiosInstance.delete("/admin/admins", { data: { email } });
			toast.success(action === "grant" ? "Admin access granted" : "Admin access revoked");
			setEmail("");
		} catch (error: unknown) {
			toast.error(getErrorMessage(error, "Unable to update admin access"));
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<section className="mb-6 rounded-lg border border-amber-500/30 bg-zinc-900 p-4">
			<h2 className="text-lg font-semibold text-amber-300">Super admin access</h2>
			<p className="mt-1 text-sm text-zinc-400">Grant or revoke admin access for an existing Clerk user.</p>
			<form className="mt-4 flex flex-col gap-2 sm:flex-row" onSubmit={(event) => updateAdminAccess(event, "grant")}>
				<input
					className="min-w-0 flex-1 rounded border border-zinc-700 bg-zinc-800 px-3 py-2 text-white"
					type="email"
					placeholder="user@example.com"
					value={email}
					onChange={(event) => setEmail(event.target.value)}
					required
				/>
				<button className="inline-flex items-center justify-center gap-2 rounded bg-emerald-600 px-4 py-2 font-medium hover:bg-emerald-500 disabled:opacity-50" disabled={isSubmitting}>
					<UserPlus className="size-4" /> Grant admin
				</button>
				<button type="button" className="inline-flex items-center justify-center gap-2 rounded border border-red-500/50 px-4 py-2 font-medium text-red-300 hover:bg-red-500/10 disabled:opacity-50" disabled={isSubmitting} onClick={(event) => updateAdminAccess(event, "revoke")}>
					<UserRoundMinus className="size-4" /> Revoke admin
				</button>
			</form>
		</section>
	);
};

export default AdminAccess;