import { UserButton } from "@clerk/clerk-react";
import { Link } from "react-router-dom";

const Header = () => {
	return (
		<div className='mb-7 flex items-center justify-between gap-3 sm:mb-8'>
			<div className='flex min-w-0 items-center gap-3'>
				<Link to='/' className='flex size-11 shrink-0 items-center justify-center rounded-full border border-zinc-700 bg-zinc-800 p-0.5'>
					<img src='/Junub%20Muziki.png' alt='Junub Muziki logo' className='size-full rounded-full object-cover' />
				</Link>
				<div>
					<h1 className='truncate text-2xl font-bold sm:text-3xl'>Music Manager</h1>
					<p className='mt-1 text-sm text-zinc-400'>Manage your music catalog</p>
				</div>
			</div>
			<UserButton />
		</div>
	);
};
export default Header;
