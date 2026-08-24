import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";

const PaymentDetailsPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const state = (location.state as { plan?: string } | null) ?? null;
    const plan = state?.plan ?? "Individual";

    // Plan prices
    const planPrices: Record<string, number> = {
        Individual: 5.99,
        Duo: 10.99,
        Family: 12.99,
        Student: 2.99,
    };

    const amount = planPrices[plan] ?? 5.99;

    useEffect(() => {
        if (!state?.plan) {
            navigate("/premium", { replace: true });
        }
    }, [navigate, state?.plan]);

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-zinc-900">
            <div className="bg-zinc-800 p-8 rounded-lg shadow-lg w-full max-w-md">
                <h2 className="text-2xl font-bold mb-4 text-center">Complete your PesaPal payment</h2>
                <div className="space-y-4">
                    <div className="space-y-4">
                        <div className="rounded-lg border border-purple-500/30 bg-purple-500/10 p-4">
                            <div className="mb-3">
                                <div>
                                    <h3 className="text-white font-semibold">PesaPal Payment</h3>
                                    <p className="text-zinc-400 text-sm">Secure online payment through PesaPal</p>
                                </div>
                            </div>
                            <div className="text-zinc-300 text-sm mb-3">
                                <p className="mb-2">Plan: <span className="text-white font-medium">{plan}</span></p>
                                <p className="text-2xl font-bold text-[#1db954]">${amount.toFixed(2)}/month</p>
                            </div>
                            <p className="text-xs text-zinc-400">
                                Pay securely using the PesaPal checkout below.
                            </p>
                            <iframe width="200" height="40" src="https://store.pesapal.com/embed-code?pageUrl=https://store.pesapal.com/send" frameBorder="0" allowFullScreen title="PesaPal payment checkout" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PaymentDetailsPage;
