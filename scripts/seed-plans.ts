import 'dotenv/config';
import { db } from '../src/lib/db';
import { subscriptionPlans } from '../src/lib/db/schema';

async function seedPlans() {
    console.log('Seeding subscription plans...');

    const plans = [
        { slug: '1_day', name: 'Paket Harian', price: 2000, durationDays: 1, bonusCredit: 0 },
        { slug: '7_day', name: 'Paket Mingguan', price: 12000, durationDays: 7, bonusCredit: 10 },
        { slug: '30_day', name: 'Paket Bulanan', price: 39000, durationDays: 30, bonusCredit: 30 },
        { slug: '90_day', name: 'Paket 3 Bulan', price: 99000, durationDays: 90, bonusCredit: 80 },
    ];

    for (const plan of plans) {
        try {
            await db.insert(subscriptionPlans).values(plan).onConflictDoNothing();
            console.log(`✓ Inserted: ${plan.name}`);
        } catch (error) {
            console.log(`✗ Skipped (exists): ${plan.name}`);
        }
    }

    console.log('Done!');
    process.exit(0);
}

seedPlans();
