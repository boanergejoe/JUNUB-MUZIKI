import { setAuthTokenProvider } from "@/lib/axios";
import { useAuthStore } from "@/stores/useAuthStore";
import { useChatStore } from "@/stores/useChatStore";
import { usePremiumStore } from "@/stores/usePremiumStore";
import { useAuth } from "@clerk/clerk-react";
import { Loader } from "lucide-react";
import { useEffect, useState } from "react";

const AuthProvider = ({ children }: { children: React.ReactNode }) => {
	const { getToken, userId, isLoaded, isSignedIn } = useAuth();
	const [loading, setLoading] = useState(true);
	const { checkAdminStatus } = useAuthStore();
	const { initSocket, disconnectSocket } = useChatStore();

	useEffect(() => {
		// Resolve a new token on every request; Clerk tokens expire quickly and a
		// token stored once at login would cause 401s on later API calls.
		setAuthTokenProvider(isSignedIn ? getToken : null);

		const initAuth = async () => {
			if (!isLoaded) return;

			try {
				if (isSignedIn && userId) {
					await checkAdminStatus();
					await usePremiumStore.getState().checkPremiumStatus();
					initSocket(userId);
				} else {
					useAuthStore.getState().reset();
					usePremiumStore.getState().reset();
					disconnectSocket();
				}
			} catch (error: any) {
				console.log("Error in auth provider", error);
			} finally {
				setLoading(false);
			}
		};

		initAuth();

		// clean up
		return () => {
			setAuthTokenProvider(null);
			disconnectSocket();
		};
	}, [getToken, userId, isLoaded, isSignedIn, checkAdminStatus, initSocket, disconnectSocket]);

	if (loading)
		return (
			<div className='h-screen w-full flex items-center justify-center'>
				<Loader className='size-8 text-emerald-500 animate-spin' />
			</div>
		);

	return <>{children}</>;
};
export default AuthProvider;
