import { Facebook, Twitter, Instagram } from "lucide-react";
import { Link } from "react-router-dom";
import { FormEvent, useState } from "react";
import toast from "react-hot-toast";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "./ui/dialog";
import { Button } from "./ui/button";

const SUPPORT_EMAIL = "boanergejoe4@gmail.com";

const Footer = () => {
    const [supportOpen, setSupportOpen] = useState(false);
    const [supportForm, setSupportForm] = useState({ name: "", email: "", message: "" });

    const handleSupportSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const subject = `Junub Muziki support request from ${supportForm.name}`;
        const body = `Name: ${supportForm.name}\nEmail: ${supportForm.email}\n\n${supportForm.message}`;
        window.location.href = `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
        setSupportOpen(false);
        setSupportForm({ name: "", email: "", message: "" });
        toast.success("Your request has been successfully sent, wait for the respond shortly. Thanks");
    };

    return (
        <>
        <footer className='bg-black text-gray-400 py-8 px-4'>
            <div className='max-w-6xl mx-auto'>
                {/* Footer Links Grid - 4 columns like Spotify */}
                <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8'>
                    <div>
                        <h3 className='text-white font-semibold mb-4'>Explore</h3>
                        <ul className='space-y-2 text-sm'>
                            <li><Link to='/' className='hover:text-white hover:underline'>Home</Link></li>
                            <li><Link to='/radio' className='hover:text-white hover:underline'>Radio</Link></li>
                            <li><Link to='/songs' className='hover:text-white hover:underline'>Songs</Link></li>
                            <li><Link to='/playlists' className='hover:text-white hover:underline'>Playlists</Link></li>
                            <li><Link to='/dj' className='hover:text-white hover:underline'>Collaborative DJ</Link></li>
                        </ul>
                    </div>
                    <div>
                        <h3 className='text-white font-semibold mb-4'>Premium</h3>
                        <ul className='space-y-2 text-sm'>
                            <li><Link to='/premium' className='hover:text-white hover:underline'>Premium overview</Link></li>
                            <li><Link to='/premium' className='hover:text-white hover:underline'>Individual plan</Link></li>
                            <li><Link to='/premium' className='hover:text-white hover:underline'>Duo plan</Link></li>
                            <li><Link to='/premium' className='hover:text-white hover:underline'>Family plan</Link></li>
                            <li><Link to='/premium' className='hover:text-white hover:underline'>Student plan</Link></li>
                        </ul>
                    </div>
                    <div>
                        <h3 className='text-white font-semibold mb-4'>Support</h3>
                        <ul className='space-y-2 text-sm'>
                            <li><Link to='/settings' className='hover:text-white hover:underline'>Account settings</Link></li>
                            <li><Link to='/liked' className='hover:text-white hover:underline'>Liked songs</Link></li>
                            <li><button type="button" onClick={() => setSupportOpen(true)} className='hover:text-white hover:underline'>Help chat</button></li>
                            <li><Link to='/search' className='hover:text-white hover:underline'>Search</Link></li>
                            <li><Link to='/admin' className='hover:text-white hover:underline'>Admin</Link></li>
                        </ul>
                    </div>
                    <div>
                        <h3 className='text-white font-semibold mb-4'>Legal</h3>
                        <ul className='space-y-2 text-sm'>
                            <li><Link to='/settings' className='hover:text-white hover:underline'>Privacy policy</Link></li>
                            <li><Link to='/settings' className='hover:text-white hover:underline'>Terms of service</Link></li>
                            <li><Link to='/settings' className='hover:text-white hover:underline'>Cookie preferences</Link></li>
                            <li><Link to='/settings' className='hover:text-white hover:underline'>Accessibility</Link></li>
                            <li><Link to='/settings' className='hover:text-white hover:underline'>Security</Link></li>
                        </ul>
                    </div>
                </div>

                <div className='flex justify-center space-x-6 mb-8'>
                    <a href='https://instagram.com' target='_blank' rel='noopener noreferrer' title='Instagram' aria-label='Instagram' className='text-gray-400 hover:text-white transition-colors'>
                        <Instagram className='h-6 w-6' />
                    </a>
                    <a href='https://twitter.com' target='_blank' rel='noopener noreferrer' title='Twitter' aria-label='Twitter' className='text-gray-400 hover:text-white transition-colors'>
                        <Twitter className='h-6 w-6' />
                    </a>
                    <a href='https://www.facebook.com' target='_blank' rel='noopener noreferrer' title='Facebook' aria-label='Facebook' className='text-gray-400 hover:text-white transition-colors'>
                        <Facebook className='h-6 w-6' />
                    </a>
                </div>

                <div className='border-t border-gray-700 pt-8'>
                    <div className='text-center mb-4'>
                        <span className='text-sm'>© 2024 Junub Muziki. All rights reserved.</span>
                    </div>
                    <div className='flex flex-wrap justify-center items-center gap-4 text-sm'>
                        <Link to='/settings' className='hover:text-white hover:underline'>Privacy policy</Link>
                        <Link to='/settings' className='hover:text-white hover:underline'>Terms</Link>
                        <Link to='/settings' className='hover:text-white hover:underline'>Cookies</Link>
                        <Link to='/settings' className='hover:text-white hover:underline'>Accessibility</Link>
                        <Link to='/settings' className='hover:text-white hover:underline'>Support</Link>
                    </div>
                </div>
            </div>
        </footer>
        <Dialog open={supportOpen} onOpenChange={setSupportOpen}>
            <DialogContent className="border-zinc-700 bg-zinc-900 text-white">
                <DialogHeader>
                    <DialogTitle>Contact support</DialogTitle>
                    <DialogDescription>Send your request to {SUPPORT_EMAIL}.</DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSupportSubmit} className="space-y-4">
                    <input required type="text" placeholder="Your name" value={supportForm.name} onChange={(event) => setSupportForm({ ...supportForm, name: event.target.value })} className="h-11 w-full rounded border border-zinc-700 bg-zinc-800 px-3 text-white" />
                    <input required type="email" placeholder="Your email" value={supportForm.email} onChange={(event) => setSupportForm({ ...supportForm, email: event.target.value })} className="h-11 w-full rounded border border-zinc-700 bg-zinc-800 px-3 text-white" />
                    <textarea required minLength={10} rows={5} placeholder="How can we help?" value={supportForm.message} onChange={(event) => setSupportForm({ ...supportForm, message: event.target.value })} className="w-full resize-y rounded border border-zinc-700 bg-zinc-800 px-3 py-2 text-white" />
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => setSupportOpen(false)}>Cancel</Button>
                        <Button type="submit">Send request</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
        </>
    );
};

export default Footer;