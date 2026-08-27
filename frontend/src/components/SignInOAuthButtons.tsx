import { SignInButton } from "@clerk/clerk-react";
import { LogIn } from "lucide-react";
import { Button } from "./ui/button";

const SignInOAuthButtons = () => (
	<SignInButton mode="modal" forceRedirectUrl="/auth-callback">
		<Button variant="secondary" className="h-11 text-white">
			<LogIn className="mr-2 size-4" />
			Sign in
		</Button>
	</SignInButton>
);

export default SignInOAuthButtons;
