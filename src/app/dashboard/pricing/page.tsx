'use client'

import React from 'react';
import { cn } from '@/lib/utils';
import { Building2, Layers3, Rocket } from 'lucide-react';
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

const FEATURES: FeatureItem[] = [
    {
        label: 'Team Seats',
        values: ['Up to 25', 'Up to 150', 'Unlimited'],
    },
    {
        label: 'Monthly Generation Credits',
        values: ['50,000', '250,000', 'Unlimited'],
    },
    {
        label: 'Compute Priority',
        values: ['High', 'Elite', 'Dedicated GPU'],
    },
    {
        label: 'AI Models Access',
        values: ['Standard Suite', 'Full Suite', 'Custom + Fine-tuned'],
    },
    {
        label: 'Custom Model Training',
        values: [false, true, true],
    },
    {
        label: 'API Access & Webhooks',
        values: [true, true, true],
    },
    {
        label: 'SSO / SAML Integration',
        values: [false, true, true],
    },
    {
        label: 'Role-Based Access Control',
        values: [false, true, true],
    },
    {
        label: 'Audit Logs & Compliance',
        values: [false, true, true],
    },
    {
        label: 'Asset Storage',
        values: ['500 GB', '5 TB', 'Unlimited'],
    },
    {
        label: 'SLA Guarantee',
        values: ['99.5%', '99.9%', '99.99%'],
    },
    {
        label: 'Support',
        values: ['Priority Email', 'Dedicated CSM', '24/7 White-Glove'],
    },
    {
        label: 'On-Premise / Private Cloud',
        values: [false, false, true],
    },
    {
        label: 'Custom Contract & Invoicing',
        values: [false, true, true],
    },
];

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
                <p className="text-xs font-bold uppercase tracking-[0.3em] text-indigo-500 mb-4">Enterprise Plans</p>
                <h1
                    className={cn(
                        'text-4xl leading-tight font-semibold text-white sm:text-6xl tracking-tight',
                    )}
                >
                    {'AI Infrastructure for '}
                    <i className="bg-gradient-to-r from-indigo-500 via-purple-400 to-fuchsia-400 bg-clip-text font-serif font-extrabold text-transparent">
                        {'Modern Teams'}
                    </i>
                    <br />
                    {'Powered by '}
                    <i className="bg-gradient-to-r from-indigo-400 via-fuchsia-400 to-amber-400 bg-clip-text font-serif font-extrabold text-transparent">
                        {'Rive AI'}
                    </i>
                </h1>
                <p className="text-zinc-400 mt-6 max-w-2xl text-pretty text-lg">
                    Enterprise-grade AI generation, team collaboration, compliance controls, and dedicated support — built to scale with your organisation.
                </p>
            </div>

            <div className="max-w-6xl mx-auto">
                <PricingTable className="mx-auto my-5">
                    <PricingTableHeader>
                        <PricingTableRow className="border-none!">
                            <th className="hidden md:table-cell" />
                            <th className="p-1">
                                <PricingTablePlan
                                    name="Growth"
                                    badge="Up to 25 seats"
                                    price="$299"
                                    compareAt="$499"
                                    icon={Layers3}
                                >
                                    <Button variant="outline" className="w-full rounded-xl border-white/10 hover:bg-white/5 text-zinc-300" size="sm">
                                        Start Trial
                                    </Button>
                                </PricingTablePlan>
                            </th>
                            <th className="p-1">
                                <PricingTablePlan
                                    name="Business"
                                    badge="Most Popular"
                                    price="$899"
                                    compareAt="$1,299"
                                    icon={Building2}
                                    className="after:pointer-events-none after:absolute after:-inset-0.5 after:rounded-[inherit] after:bg-gradient-to-b after:from-indigo-500/15 after:to-transparent after:blur-[2px] border-indigo-500/30"
                                >
                                    <Button
                                        className="w-full rounded-xl bg-indigo-600 text-white hover:bg-indigo-500 shadow-lg shadow-indigo-500/20"
                                        size="sm"
                                    >
                                        Contact Sales
                                    </Button>
                                </PricingTablePlan>
                            </th>
                            <th className="p-1 md:table-cell hidden">
                                <PricingTablePlan
                                    name="Enterprise"
                                    badge="Custom Pricing"
                                    price="Custom"
                                    icon={Rocket}
                                >
                                    <Button variant="outline" className="w-full rounded-xl border-white/10 hover:bg-white/5 text-zinc-300" size="sm">
                                        Talk to Us
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
