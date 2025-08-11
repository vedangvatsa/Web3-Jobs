
'use client';

import type { ContentBlock } from '@/types';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Code,
  GanttChartSquare,
  Globe,
  Group,
  Landmark,
  Layers,
  Lock,
  MessageSquare,
  TestTube,
  ThumbsDown,
  Zap,
} from 'lucide-react';
import React from 'react';

const renderNode = (node: any, key: number) => {
  if (!node || !node.type) return null;
  switch (node.type) {
    case 'text':
      if (node.style === 'bold') return <strong key={key}>{node.value}</strong>;
      if (node.style === 'italic') return <em key={key}>{node.value}</em>;
      return node.value;
    case 'link':
      return (
        <Link
          key={key}
          href={node.href}
          className="text-primary hover:underline"
        >
          {node.value}
        </Link>
      );
    default:
      return null;
  }
};

const iconMap: { [key: string]: React.ComponentType<any> } = {
  decentralization: Globe,
  blockchain: Layers,
  trustless: Lock,
  ownership: Code,
  defi: Landmark,
  nfts: GanttChartSquare,
  daos: Group,
  'decentralized-social': MessageSquare,
  ux: ThumbsDown,
  scalability: Zap,
  security: Lock,
  regulation: TestTube,
};

const renderBlock = (block: ContentBlock, index: number) => {
  switch (block.type) {
    case 'h2':
      return (
        <h2 key={index} className="text-3xl font-bold mt-8 mb-4">
          {block.children.map((child, i) => renderNode(child, i))}
        </h2>
      );
    case 'h3':
      return (
        <h3 key={index} className="text-2xl font-bold mt-6 mb-3">
          {block.children.map((child, i) => renderNode(child, i))}
        </h3>
      );
    case 'p':
      return (
        <p key={index} className="mb-4 leading-relaxed">
          {block.children.map((child, i) => renderNode(child, i))}
        </p>
      );
    case 'ul':
      return (
        <ul
          key={index}
          className="list-disc list-inside mb-4 pl-4 space-y-2"
        >
          {block.children.map((li: any, i: number) => (
            <li key={i}>{li.children.map((child: any, j: number) => renderNode(child, j))}</li>
          ))}
        </ul>
      );
    case 'blockquote':
      return (
        <blockquote key={index} className="border-l-4 border-primary pl-4 italic my-6">
          <div className="flex flex-col gap-y-2">
            {block.children.map((p: any, i: number) => (
              <p key={i}>{p.children.map((child: any, j: number) => renderNode(child, j))}</p>
            ))}
          </div>
        </blockquote>
      );
    case 'cta':
      return (
        <div
          key={index}
          className="my-8 p-6 bg-card/50 rounded-lg flex justify-center"
        >
          <Button
            size="lg"
            asChild
            className="bg-accent hover:bg-accent/90 text-accent-foreground"
          >
            <Link href={block.href} target="_blank" rel="noopener noreferrer">
              {block.text}
            </Link>
          </Button>
        </div>
      );
    case 'keyPoints':
      return (
        <div key={index} className="my-8 grid gap-6 md:grid-cols-2">
          {block.points.map((point, pointIndex) => {
            const Icon = iconMap[point.icon];
            if (!Icon) return null;
            return (
              <Card key={pointIndex} className="bg-card/50">
                <CardHeader className="flex flex-row items-center gap-4">
                  <Icon className="h-8 w-8 text-primary" />
                  <CardTitle className="text-lg">{point.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    {point.description.map((desc, i) => renderNode(desc, i))}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      );
    default:
      return null;
  }
};

export function ArticleContent({ content }: { content: ContentBlock[] }) {
  return <>{content.map(renderBlock)}</>;
}
