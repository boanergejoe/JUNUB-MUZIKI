import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth, useClerk } from "@clerk/clerk-react";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { ExternalLink, Loader2 } from "lucide-react";
import { getErrorMessage } from "@/lib/utils";
import { usePremiumStore, type PaymentStatus } from "@/stores/usePremiumStore";

const PaymentDetailsPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const state = (location.state as { plan?: string; method?: string } | null) ?? null;
    const plan = state?.plan ?? "Individual";

    const { isSignedIn } = useAuth();
    const { openSignIn } = useClerk();
    const { createPayment, checkPayment, checkPremiumStatus, isLoading } = usePremiumStore();
    const [orderTrackingId, setOrderTrackingId] = useState<string | null>(
        () => sessionStorage.getItem(`junub:payment:order:${plan}`)
    );
    const [paymentUrl, setPaymentUrl] = useState<string | null>(
        () => sessionStorage.getItem(`junub:payment:url:${plan}`)
    );
    const [paymentStatus, setPaymentStatus] = useState<PaymentStatus | null>(null);
    const [startingPayment, setStartingPayment] = useState(false);
    const pollRef = useRef<number | null>(null);

    const stopPolling = useCallback(() => {
        if (pollRef.current !== null) {
            window.clearInterval(pollRef.current);
            pollRef.current = null;
        }
    }, []);

    const startPolling = useCallback(
        (orderId: string) => {
            stopPolling();
            let attempts = 0;

            pollRef.current = window.setInterval(async () => {
                attempts += 1;
                try {
                    const status = await checkPayment(orderId);
                    setPaymentStatus(status);

                    if (status === "completed") {
                        stopPolling();
                        sessionStorage.removeItem(`junub:payment:order:${plan}`);
                        sessionStorage.removeItem(`junub:payment:url:${plan}`);
                        await checkPremiumStatus();
                        toast.success("Premium activated. Enjoy the music!");
                    } else if (status === "failed" || status === "expired") {
                        stopPolling();
                        toast.error(`Payment ${status}. Please try again.`);
                    } else if (attempts >= 40) {
                        stopPolling();
                        toast.error("Payment check timed out. Please check again later.");
                    }
                } catch (error) {
                    console.error("Error checking payment:", error);
                }
            }, 3000);
        },
        [checkPayment, checkPremiumStatus, plan, stopPolling]
    );

    useEffect(() => {
        if (!state?.plan) {
            navigate("/premium", { replace: true });
        }
    }, [navigate, state?.plan]);

    useEffect(() => {
        if (orderTrackingId) startPolling(orderTrackingId);
        return stopPolling;
    }, [orderTrackingId, startPolling, stopPolling]);

    const handlePay = async () => {
        if (!isSignedIn) {
            openSignIn({});
            return;
        }

        setStartingPayment(true);
        try {
            const payment = await createPayment(plan);
            setOrderTrackingId(payment.orderTrackingId);
            setPaymentUrl(payment.paymentUrl);
            setPaymentStatus("pending");
            sessionStorage.setItem(`junub:payment:order:${plan}`, payment.orderTrackingId);
            sessionStorage.setItem(`junub:payment:url:${plan}`, payment.paymentUrl);
            window.open(payment.paymentUrl, "_blank", "noopener,noreferrer");
            toast.success("Complete your payment in the PesaPal tab");
        } catch (error: unknown) {
            toast.error(getErrorMessage(error, "Unable to start payment"));
        } finally {
            setStartingPayment(false);
        }
    };

    // Plan prices
    const planPrices: Record<string, number> = {
        Individual: 5.99,
        Duo: 10.99,
        Family: 12.99,
        Student: 2.99,
    };

    const amount = planPrices[plan] ?? 5.99;
    const busy = startingPayment || isLoading;

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-zinc-900">
            <div className="bg-zinc-800 p-8 rounded-lg shadow-lg w-full max-w-md">
                <h2 className="text-2xl font-bold mb-4 text-center">Complete your PesaPal payment</h2>
                <div className="space-y-4">
                    <div className="rounded-lg border border-purple-500/30 bg-purple-500/10 p-4">
                        <h3 className="text-white font-semibold mb-3">PesaPal Payment</h3>
                        <div className="text-zinc-300 text-sm mb-4">
                            <p className="mb-2">Plan: <span className="text-white font-medium">{plan}</span></p>
                            <p className="text-2xl font-bold text-[#1db954]">${amount.toFixed(2)}/month</p>
                        </div>

                        <Button className="w-full" onClick={handlePay} disabled={busy}>
                            {busy ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                            {isSignedIn ? "Pay with PesaPal" : "Sign in to pay"}
                        </Button>

                        {paymentUrl && (
                            <a
                                href={paymentUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="mt-3 flex items-center justify-center gap-2 text-sm text-purple-300 hover:text-purple-200"
                            >
                                Reopen payment page <ExternalLink className="h-4 w-4" />
                            </a>
                        )}

                        {paymentStatus && (
                            <p className="mt-4 text-center text-sm text-zinc-300">
                                Payment status: <span className="font-semibold text-white">{paymentStatus}</span>
                            </p>
                        )}

                        <p className="mt-4 text-xs text-zinc-400 text-center">
                            After paying, this page checks the backend automatically and unlocks Premium.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PaymentDetailsPage;
