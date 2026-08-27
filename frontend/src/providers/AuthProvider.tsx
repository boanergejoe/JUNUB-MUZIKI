import { axiosInstance } from "@/lib/axios";
import { useAuthStore } from "@/stores/useAuthStore";
import { useChatStore } from "@/stores/useChatStore";
import { useAuth } from "@clerk/clerk-react";
import { Loader } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

const updateApiToken = (token: string | null) => {
	if (token) axiosInstance.defaults.headers.common["Authorization"] = `Bearer ${token}`;
	else delete axiosInstance.defaults.headers.common["Authorization"];
};

const AuthProvider = ({ children }: { children: React.ReactNode }) => {
	const { getToken, userId, isLoaded, isSignedIn } = useAuth();
	const [loading, setLoading] = useState(true);
	const { checkAdminStatus } = useAuthStore();
	const { initSocket, disconnectSocket } = useChatStore();
	const navigate = useNavigate();
	const location = useLocation();

	useEffect(() => {
		const initAuth = async () => {
			if (!isLoaded) return;

			try {
				const token = isSignedIn ? await getToken() : null;
				updateApiToken(token);
				if (token && userId) {
					await checkAdminStatus();
					const { isAdmin } = useAuthStore.getState();
					if (isAdmin && location.pathname !== "/admin") navigate("/admin", { replace: true });
					// init socket
					if (userId) initSocket(userId);
				} else {
					useAuthStore.getState().reset();
				}
			} catch (error: any) {
				updateApiToken(null);
				console.log("Error in auth provider", error);
			} finally {
				setLoading(false);
			}
		};

		initAuth();

		// clean up
		return () => disconnectSocket();
	}, [getToken, userId, isLoaded, isSignedIn, checkAdminStatus, initSocket, disconnectSocket, location.pathname, navigate]);

	if (loading)
		return (
			<div className='h-screen w-full flex items-center justify-center'>
				<Loader className='size-8 text-emerald-500 animate-spin' />
			</div>
		);

	return <>{children}</>;
};
export default AuthProvider;
