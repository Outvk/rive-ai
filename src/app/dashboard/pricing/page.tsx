'use client'

import React from 'react';
import { cn } from '@/lib/utils';
import { Shield, Users, Rocket } from 'lucide-react';
import {
    type FeatureItem,
    PricingTable,
    PricingTableBody,
    PricingTableHeader,
    PricingTableRow,
    PricingTableHead,
    PricingTableCell,
    PricingTablePlan,
} from '@/components/ui/pricing-table';
import { Button } from '@/components/ui/button';

export default function PricingPage() {
    return (
        <div className="relative min-h-screen overflow-hidden px-4 py-20 fade-in">
            <div
                className={cn(
                    'absolute inset-0 z-[-10] size-full max-h-[600px] opacity-20',
                    '[mask-image:radial-gradient(ellipse_at_center,black,transparent)]',
                )}
                style={{
                    backgroundImage:
                        'radial-gradient(rgb(79 70 229 / 0.4) 1px, transparent 1px)',
                    backgroundSize: '32px 32px',
                }}
            />
            <div className="relative mx-auto flex max-w-4xl flex-col items-center text-center mb-16">
                <p className="text-xs font-bold uppercase tracking-[0.3em] text-indigo-500 mb-4">Pricing Plans</p>
                <h1
                    className={cn(
                        'text-4xl leading-tight font-semibold text-white sm:text-6xl tracking-tight',
                    )}
                >
                    {'Scaling your '}
                    <i className="bg-gradient-to-r from-indigo-500 via-purple-400 to-fuchsia-400 bg-clip-text font-serif font-extrabold text-transparent">
                        {'Creativity'}
                    </i>
                    <br />
                    {'with '}
                    <i className="bg-gradient-to-r from-indigo-400 via-fuchsia-400 to-amber-400 bg-clip-text font-serif font-extrabold text-transparent">
                        {'Rive AI'}
                    </i>
                </h1>
                <p className="text-zinc-400 mt-6 max-w-2xl text-pretty text-lg">
                    Deploy consistent creative assets faster with our AI solutions. Simple pricing, powerful tools.
                </p>
            </div>

            <div className="max-w-6xl mx-auto">
                <PricingTable className="mx-auto my-5">
                    <PricingTableHeader>
                        <PricingTableRow className="border-none!">
                            <th className="hidden md:table-cell" />
                            <th className="p-1">
                                <PricingTablePlan
                                    name="Solo"
                                    badge="For Freelancers"
                                    price="$29"
                                    compareAt="$59"
                                    icon={Shield}
                                >
                                    <Button variant="outline" className="w-full rounded-xl border-white/10 hover:bg-white/5 text-zinc-300" size="lg">
                                        Get Started
                                    </Button>
                                </PricingTablePlan>
                            </th>
                            <th className="p-1">
                                <PricingTablePlan
                                    name="Teams"
                                    badge="Popular"
                                    price="$99"
                                    compareAt="$139"
                                    icon={Users}
                                    className="after:pointer-events-none after:absolute after:-inset-0.5 after:rounded-[inherit] after:bg-gradient-to-b after:from-indigo-500/15 after:to-transparent after:blur-[2px] border-indigo-500/30"
                                >
                                    <Button
                                        className="w-full rounded-xl bg-indigo-600 text-white hover:bg-indigo-500 shadow-lg shadow-indigo-500/20"
                                        size="lg"
                                    >
                                        Get Started
                                    </Button>
                                </PricingTablePlan>
                            </th>
                            <th className="p-1 md:table-cell hidden">
                                <PricingTablePlan
                                    name="Scale"
                                    badge="Enterprise"
                                    price="$239"
                                    compareAt="$299"
                                    icon={Rocket}
                                >
                                    <Button variant="outline" className="w-full rounded-xl border-white/10 hover:bg-white/5 text-zinc-300" size="lg">
                                        Get Started
                                    </Button>
                                </PricingTablePlan>
                            </th>
                        </PricingTableRow>
                    </PricingTableHeader>
                    <PricingTableBody className="border-white/5!">
                        {FEATURES.map((feature, index) => (
                            <PricingTableRow key={index} className="border-white/5!">
                                <PricingTableHead className="text-zinc-400 font-medium py-6">{feature.label}</PricingTableHead>
                                {feature.values.map((value, idx) => (
                                    <PricingTableCell key={idx} className="text-zinc-300 py-6">
                                        {value}
                                    </PricingTableCell>
                                ))}
                            </PricingTableRow>
                        ))}
                    </PricingTableBody>
                </PricingTable>
            </div>
        </div>
    );
}

export const FEATURES: FeatureItem[] = [
    {
        label: 'Generation Credits',
        values: ['500 / mo', '2,500 / mo', 'Unlimited'],
    },
    {
        label: 'Compute Priority',
        values: ['Standard', 'High', 'Elite'],
    },
    {
        label: 'AI Models',
        values: [true, true, true],
    },
    {
        label: 'Custom Training',
        values: [false, true, true],
    },
    {
        label: 'API Access',
        values: [false, true, true],
    },
    {
        label: 'Commercial Rights',
        values: [true, true, true],
    },
    {
        label: 'Storage',
        values: ['5 GB', '50 GB', 'Unlimited'],
    },
    {
        label: 'Support',
        values: ['Email', 'Priority', '24/7 Dedicated'],
    },
];
