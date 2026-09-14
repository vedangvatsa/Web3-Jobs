
'use client';

import type { ResumeData } from '@/types';
import { Card, CardContent } from './ui/card';
import { Mail, Phone, Link as LinkIcon, Github, Twitter } from 'lucide-react';

export const ResumePreview = ({ data }: { data: ResumeData }) => {
  return (
    <Card className="shadow-sm overflow-hidden">
      <CardContent className="p-4 sm:p-8 font-sans text-gray-800 bg-white">
        <div className="text-center border-b pb-4 mb-6">
          <h1 className="text-[clamp(1.25rem,5vw,28pt)] font-bold text-gray-900 leading-tight break-words">{data.name ||"Your Name"}</h1>
          <h2 className="text-[clamp(0.75rem,3vw,14pt)] font-normal text-gray-500 tracking-[2px] uppercase mt-1 break-words">{data.title ||"Your Title"}</h2>
          <div className="flex justify-center items-center flex-wrap gap-x-4 gap-y-1 mt-3 text-[9pt] text-gray-600">
            {data.email && <div className="flex items-center gap-1.5 min-w-0"><Mail size={11} className="shrink-0"/><span className="truncate">{data.email}</span></div>}
            {data.phone && <div className="flex items-center gap-1.5"><Phone size={11} className="shrink-0"/>{data.phone}</div>}
            {data.website && <div className="flex items-center gap-1.5 min-w-0"><LinkIcon size={11} className="shrink-0"/><span className="truncate">{data.website.replace('https://', '')}</span></div>}
            {data.github && <div className="flex items-center gap-1.5 min-w-0"><Github size={11} className="shrink-0"/><span className="truncate">{data.github.replace('https://github.com/', '')}</span></div>}
            {data.twitter && <div className="flex items-center gap-1.5 min-w-0"><Twitter size={11} className="shrink-0"/><span className="truncate">{data.twitter.replace('https://twitter.com/', '@')}</span></div>}
            {data.handle && <div className="flex items-center gap-1.5"><span className="font-bold">Handle:</span>{data.handle}</div>}
          </div>
        </div>

        <div className="mb-6">
          <h3 className="text-[12pt] font-bold text-gray-900 mb-2">Summary</h3>
          <p className="text-[10pt] text-gray-700 leading-normal">{data.summary ||"Your professional summary and passion."}</p>
        </div>
        
        <div className="mb-4">
          <h3 className="text-[12pt] font-bold text-gray-900 mb-2">Key Projects & Portfolio</h3>
          <div className="space-y-3">
            {data.contributions?.map((c, i) => (
              <div key={i}>
                <h4 className="font-bold text-[10pt] text-gray-800">
                  {c.project ||"Project Name"} | <span className="font-medium italic text-gray-600">{c.role ||"Your Role"}</span>
                </h4>
                <p className="text-[10pt] text-gray-700 my-1 leading-normal">{c.description ||"Description of your amazing contribution."}</p>
                {c.link && <a href={c.link} target="_blank" rel="noopener noreferrer" className="text-[9pt] text-primary hover:underline break-all">{c.link}</a>}
              </div>
            ))}
          </div>
        </div>

        <div className="mb-4">
          <h3 className="text-[12pt] font-bold text-gray-900 mb-2">Professional Experience</h3>
           <div className="space-y-4">
            {data.experience?.map((e, i) => (
               <div key={i}>
                <div className="flex flex-wrap justify-between items-baseline gap-x-2 gap-y-1">
                  <h4 className="font-bold text-[10pt] text-gray-800 min-w-0 break-words">{e.role ||"Your Role"} <span className="font-normal text-gray-600">at {e.company ||"Company Name"}</span></h4>
                  <span className="text-[10pt] font-medium text-gray-500 shrink-0">{e.date ||"Date Range"}</span>
                </div>
                <p className="text-[10pt] text-gray-700 mt-1 leading-normal">{e.description ||"Description of your responsibilities and key achievements."}</p>
              </div>
            ))}
          </div>
        </div>

         <div className="mb-6">
          <h3 className="text-[12pt] font-bold text-gray-900 mb-2">Education</h3>
           <div className="space-y-3">
            {data.education?.map((ed, i) => (
               <div key={i}>
                <div className="flex flex-wrap justify-between items-baseline gap-x-2 gap-y-1">
                  <h4 className="font-bold text-[10pt] text-gray-800 min-w-0 break-words">{ed.degree ||"Degree / Certificate"}</h4>
                  <span className="text-[10pt] font-medium text-gray-500 shrink-0">{ed.date ||"Date"}</span>
                </div>
                <p className="text-[10pt] italic text-gray-700">{ed.institution ||"Institution Name"}</p>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-[12pt] font-bold text-gray-900 mb-2">Skills</h3>
          <div className="text-[10pt] leading-normal space-y-2">
            <div className="flex flex-col sm:flex-row gap-1 sm:gap-0">
              <p className="sm:w-[140px] shrink-0 font-bold text-gray-600">Technical Skills:</p>
              <p className="text-gray-700 min-w-0 break-words">{data.technicalSkills ||"Solidity, Foundry, etc."}</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-1 sm:gap-0">
              <p className="sm:w-[140px] shrink-0 font-bold text-gray-600">General Skills:</p>
              <p className="text-gray-700 min-w-0 break-words">{data.generalSkills ||"React, Python, etc."}</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
