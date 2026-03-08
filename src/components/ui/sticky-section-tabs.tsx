"use client"

import React, { Children, isValidElement } from 'react';
import clsx from 'clsx';

interface StickyTabItemProps {
    title: string;
    id: string | number;
    children: React.ReactNode;
}

const StickyTabItem: React.FC<StickyTabItemProps> = () => {
    return null;
};

interface StickyTabsProps {
    children: React.ReactNode;
    mainNavHeight?: string;
    rootClassName?: string;
    navSpacerClassName?: string;
    sectionClassName?: string;
    stickyHeaderContainerClassName?: string;
    headerContentWrapperClassName?: string;
    headerContentLayoutClassName?: string;
    titleClassName?: string;
    contentLayoutClassName?: string;
}

const StickyTabs: React.FC<StickyTabsProps> & { Item: React.FC<StickyTabItemProps> } = ({
    children,
    mainNavHeight = '4rem',
    rootClassName = "bg-transparent text-white",
    navSpacerClassName = "bg-transparent",
    sectionClassName = "bg-zinc-900/20",
    stickyHeaderContainerClassName = "shadow-xl shadow-black/20",
    headerContentWrapperClassName = "border-b border-white/5 bg-zinc-950/80 backdrop-blur-xl",
    headerContentLayoutClassName = "mx-auto max-w-7xl px-4 py-5 sm:px-6 lg:px-8",
    titleClassName = "my-0 text-xl font-semibold leading-none md:text-2xl text-indigo-400",
    contentLayoutClassName = "mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 text-zinc-400 leading-relaxed",
}) => {
    const stickyTopValue = mainNavHeight;
    const stickyHeaderStyle = { top: stickyTopValue };

    return (
        <div className={clsx("overflow-visible", rootClassName)}>
            {Children.map(children, (child) => {
                if (!isValidElement(child)) return null;

                // Robust check: if it has a title prop, we treat it as an item
                // This avoid issues with HMR or Server/Client boundaries where function references might differ
                const props = child.props as any;
                if (!props.title) return null;

                const { title, id, children: itemContent } = props;

                return (
                    <section
                        key={id}
                        id={id?.toString()}
                        className={clsx(
                            "relative overflow-visible border-b border-white/5 last:border-0",
                            sectionClassName
                        )}
                    >
                        <div
                            className={clsx(
                                "sticky z-10 flex flex-col",
                                stickyHeaderContainerClassName
                            )}
                            style={stickyHeaderStyle}
                        >
                            <div className={clsx(headerContentWrapperClassName)}>
                                <div className={clsx(headerContentLayoutClassName)}>
                                    <div className="flex items-center justify-between">
                                        <h2 className={clsx(titleClassName)}>
                                            {title}
                                        </h2>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className={clsx(contentLayoutClassName)}>
                            {itemContent}
                        </div>

                    </section>
                );
            })}
        </div>
    );
};

StickyTabs.Item = StickyTabItem;

export default StickyTabs;
