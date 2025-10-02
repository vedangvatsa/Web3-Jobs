
'use client';

import type { ResumeData } from '@/types';
import { Card, CardContent } from './ui/card';
import { Mail, Phone, Link as LinkIcon, Github, Twitter } from 'lucide-react';

export const ResumePreview = ({ data }: { data: ResumeData }) => {
    return (
        <Card className="shadow-lg">
            <CardContent className="p-8 font-sans text-gray-800 bg-white">
                <div className="text-center border-b pb-4 mb-6">
                    <h1 className="text-[28pt] font-bold text-gray-900 leading-tight">{data.name || "Your Name"}</h1>
                    <h2 className="text-[14pt] font-normal text-gray-500 tracking-[2px] uppercase mt-1">{data.title || "Your Title"}</h2>
                    <div className="flex justify-center items-center flex-wrap gap-x-4 gap-y-1 mt-3 text-[9pt] text-gray-600">
                        {data.email && <div className="flex items-center gap-1.5"><Mail size={11}/>{data.email}</div>}
                        {data.phone && <div className="flex items-center gap-1.5"><Phone size={11}/>{data.phone}</div>}
                        {data.website && <div className="flex items-center gap-1.5"><LinkIcon size={11}/>{data.website.replace('https://', '')}</div>}
                        {data.github && <div className="flex items-center gap-1.5"><Github size={11}/>{data.github.replace('https://github.com/', '')}</div>}
                        {data.twitter && <div className="flex items-center gap-1.5"><Twitter size={11}/>{data.twitter.replace('https://twitter.com/', '@')}</div>}
                        {data.ens && <div className="flex items-center gap-1.5"><span className="font-bold">ENS:</span>{data.ens}</div>}
                    </div>
                </div>

                <div className="mb-6">
                    <h3 className="text-[12pt] font-bold text-gray-900 mb-2">Summary</h3>
                    <p className="text-[10pt] text-gray-700 leading-normal">{data.summary || "Your professional summary and passion for Web3."}</p>
                </div>
                
                <div className="mb-4">
                    <h3 className="text-[12pt] font-bold text-gray-900 mb-2">Web3 Contributions & Portfolio</h3>
                    <div className="space-y-3">
                        {data.contributions?.map((c, i) => (
                            <div key={i}>
                                <h4 className="font-bold text-[10pt] text-gray-800">
                                    {c.project || "Project Name"} — <span className="font-medium italic text-gray-600">{c.role || "Your Role"}</span>
                                </h4>
                                <p className="text-[10pt] text-gray-700 my-1 leading-normal">{c.description || "Description of your amazing contribution."}</p>
                                {c.link && <a href={c.link} target="_blank" rel="noopener noreferrer" className="text-[9pt] text-blue-600 hover:underline break-all">{c.link}</a>}
                            </div>
                        ))}
                    </div>
                </div>

                <div className="mb-4">
                    <h3 className="text-[12pt] font-bold text-gray-900 mb-2">Professional Experience</h3>
                     <div className="space-y-4">
                        {data.experience?.map((e, i) => (
                             <div key={i}>
                                <div className="flex justify-between items-baseline">
                                    <h4 className="font-bold text-[10pt] text-gray-800">{e.role || "Your Role"} <span className="font-normal text-gray-600">at {e.company || "Company Name"}</span></h4>
                                    <span className="text-[10pt] font-medium text-gray-500">{e.date || "Date Range"}</span>
                                </div>
                                <p className="text-[10pt] text-gray-700 mt-1 leading-normal">{e.description || "Description of your responsibilities and key achievements."}</p>
                            </div>
                        ))}
                    </div>
                </div>

                 <div className="mb-6">
                    <h3 className="text-[12pt] font-bold text-gray-900 mb-2">Education</h3>
                     <div className="space-y-3">
                        {data.education?.map((ed, i) => (
                             <div key={i}>
                                <div className="flex justify-between items-baseline">
                                    <h4 className="font-bold text-[10pt] text-gray-800">{ed.degree || "Degree / Certificate"}</h4>
                                    <span className="text-[10pt] font-medium text-gray-500">{ed.date || "Date"}</span>
                                </div>
                                <p className="text-[10pt] italic text-gray-700">{ed.institution || "Institution Name"}</p>
                            </div>
                        ))}
                    </div>
                </div>

                <div>
                    <h3 className="text-[12pt] font-bold text-gray-900 mb-2">Skills</h3>
                    <div className="text-[10pt] leading-normal space-y-2">
                       <div className="flex">
                           <p className="w-[140px] shrink-0 font-bold text-gray-600">Web3 / Blockchain:</p>
                           <p className="text-gray-700">{data.web3Skills || "Solidity, Foundry, etc."}</p>
                       </div>
                        <div className="flex">
                           <p className="w-[140px] shrink-0 font-bold text-gray-600">Technical / General:</p>
                           <p className="text-gray-700">{data.generalSkills || "React, Python, etc."}</p>
                       </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
