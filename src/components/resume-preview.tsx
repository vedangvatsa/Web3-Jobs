
'use client';

import type { ResumeData } from '@/types';
import { Card, CardContent } from './ui/card';
import { Mail, Phone, Link as LinkIcon, Github, Twitter } from 'lucide-react';

export const ResumePreview = ({ data }: { data: ResumeData }) => {
    return (
        <Card className="shadow-lg">
            <CardContent className="p-8 font-sans text-gray-800">
                <div className="text-center border-b pb-4 mb-6">
                    <h1 className="text-4xl font-bold text-gray-900">{data.name || "Your Name"}</h1>
                    <h2 className="text-lg font-medium text-primary">{data.title || "Your Title"}</h2>
                    <div className="flex justify-center items-center gap-4 mt-2 text-xs text-gray-600">
                        {data.email && <div className="flex items-center gap-1"><Mail size={12}/>{data.email}</div>}
                        {data.phone && <div className="flex items-center gap-1"><Phone size={12}/>{data.phone}</div>}
                        {data.website && <div className="flex items-center gap-1"><LinkIcon size={12}/>{data.website.replace('https://', '')}</div>}
                        {data.github && <div className="flex items-center gap-1"><Github size={12}/>{data.github.replace('https://github.com/', '')}</div>}
                        {data.twitter && <div className="flex items-center gap-1"><Twitter size={12}/>{data.twitter.replace('https://twitter.com/', '@')}</div>}
                        {data.ens && <div className="flex items-center gap-1"><span className="font-bold">ENS:</span>{data.ens}</div>}
                    </div>
                </div>

                <div className="mb-6">
                    <h3 className="text-sm font-bold uppercase tracking-widest text-primary mb-2">Summary</h3>
                    <p className="text-sm text-gray-700">{data.summary || "Your professional summary and passion for Web3."}</p>
                </div>
                
                <div className="mb-6">
                    <h3 className="text-sm font-bold uppercase tracking-widest text-primary mb-2">Web3 Contributions & Portfolio</h3>
                    <div className="space-y-4">
                        {data.contributions?.map((c, i) => (
                            <div key={i}>
                                <h4 className="font-bold text-gray-800">{c.project} — <span className="font-medium italic text-gray-600">{c.role}</span></h4>
                                <p className="text-xs text-gray-600 my-1">{c.description}</p>
                                {c.link && <a href={c.link} target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline">{c.link}</a>}
                            </div>
                        ))}
                    </div>
                </div>

                <div className="mb-6">
                    <h3 className="text-sm font-bold uppercase tracking-widest text-primary mb-2">Professional Experience</h3>
                     <div className="space-y-4">
                        {data.experience?.map((e, i) => (
                             <div key={i}>
                                <div className="flex justify-between items-baseline">
                                    <h4 className="font-bold text-gray-800">{e.role}</h4>
                                    <span className="text-xs font-medium text-gray-500">{e.date}</span>
                                </div>
                                <p className="text-sm font-medium text-gray-600">{e.company}</p>
                                <p className="text-xs text-gray-600 mt-1">{e.description}</p>
                            </div>
                        ))}
                    </div>
                </div>

                 <div className="mb-6">
                    <h3 className="text-sm font-bold uppercase tracking-widest text-primary mb-2">Education</h3>
                     <div className="space-y-2">
                        {data.education?.map((ed, i) => (
                             <div key={i}>
                                <div className="flex justify-between items-baseline">
                                    <h4 className="font-bold text-gray-800">{ed.degree}</h4>
                                    <span className="text-xs font-medium text-gray-500">{ed.date}</span>
                                </div>
                                <p className="text-sm font-medium text-gray-600">{ed.institution}</p>
                            </div>
                        ))}
                    </div>
                </div>

                <div>
                    <h3 className="text-sm font-bold uppercase tracking-widest text-primary mb-2">Skills</h3>
                    <div className="text-xs">
                        <p><strong className="font-medium text-gray-700">Web3/Blockchain:</strong> {data.web3Skills}</p>
                        <p className="mt-1"><strong className="font-medium text-gray-700">General/Technical:</strong> {data.generalSkills}</p>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
