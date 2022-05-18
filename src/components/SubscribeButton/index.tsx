import { signIn, signout, useSession } from 'next-auth/client'
import { useRouter } from 'next/router';

import styles from './styles.module.scss';
import { getStripeJs } from '../../services/stripe-js';
import { api } from '../../services/api';


export function SubscribeButton() {
    const [session] = useSession();
    const router = useRouter();

    async function handleSubscribe() {
        if (!session) {
            signIn('github')
            return;
        }

        if (session.activeSubscription) {
            router.push('/posts');
            return;
        }

        try {
            const response = await api.post('/subscribe')
            const { sessionId } = response.data;
            const stripe = await getStripeJs()
            await stripe.redirectToCheckout({ sessionId })
        } catch (err) {
            alert(err.message);
        }

    }

    return (
        <button
            type="button"
            className={styles.subscribeButton}
            onClick={handleSubscribe}
        >
            Subscribe now
        </button>
    );
}