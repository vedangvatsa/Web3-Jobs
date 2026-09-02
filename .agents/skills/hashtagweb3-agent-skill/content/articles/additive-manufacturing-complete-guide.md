---
title: Additive Manufacturing Complete Guide
description: >-
  A full guide to additive manufacturing, also known as 3D printing, covering
  its processes, materials, benefits, trade-offs, and how to choose the right
  method for prototyping and low-volume production.
category: Educational
image: 'https://picsum.photos/seed/additivemfg/1200/630'
data-ai-hint: industrial 3d
publishedDate: '2026-03-11'
lastUpdated: "2026-08-28"
---

Additive manufacturing builds parts by joining material layer by layer from 3D model data. It is the formal industrial term for what most people call 3D printing.

ISO/ASTM 52900:2021 defines it as the process of joining materials to make parts from 3D model data, usually layer upon layer, as opposed to subtractive methods that cut material away and formative methods that shape material with molds or dies. The standard remains current after its 2025 review and is the shared vocabulary for the field.

## What it is

Additive manufacturing creates physical objects directly from a digital model. You design in CAD, export a file, slice it into thin horizontal layers, and the machine builds each layer in order. The part grows from the build plate up until it matches the digital design.

The term covers seven distinct process families in ISO/ASTM 52900. Material and energy determine which family fits your part. Common materials include thermoplastics, photopolymer resins, metal powders, ceramics, waxes, sand, and composites. Forms include filament, powder, liquid resin, wire, and sheets.

The market reflects steady production use, not just prototyping. AM Research tracked total hardware, materials, and services at $15.9 billion for 2024, up 8.3 percent year over year, with a forecast of $57.8 billion by 2033. Wohlers Associates reported $20.0 billion for the broader industry in 2023. Polymer systems still lead on installed base, metal systems grew fastest at 24.4 percent system growth in 2023.

## Who it is for

Additive works best for specific jobs. It is a poor fit for high-volume simple shapes where tooling has already been paid for.

It is a strong fit for:

*   **Product teams that iterate fast.** Industrial designers, mechanical engineers, and hardware founders who need a physical prototype in 1 to 3 days instead of waiting 8 to 16 weeks for soft tooling. NIST notes this bypasses tooling lead time and lets teams test form, fit, and function before freezing a design.
*   **Aerospace, space, and defense engineers.** Lightweight brackets, ducts, and rocket components that use lattices or consolidated assemblies to cut part count. AMPOWER and Wohlers both place aerospace and defense among the largest users of metal powder bed fusion.
*   **Medical and dental professionals.** Custom implants, surgical guides, prosthetics, and aligners made to patient scans. Medical and dental are the only verticals that already run daily serial production on additive, per AMPOWER 2024.
*   **Automotive, energy, and industrial maintenance teams.** Jigs, fixtures, conformal cooling inserts for molds, and low-volume or end-of-life spare parts where storing inventory costs more than printing on demand.
*   **Educators, researchers, and small shops.** Entry-level material extrusion printers start around $200 to $500 and run PLA and PETG with minimal setup. They are practical for teaching design, making fixtures, and testing ideas before paying a service bureau.

It is not the right choice if you need millions of identical simple parts in a commodity thermoplastic, with tight per-unit cost targets and no need for customization. In those cases injection molding remains faster and cheaper per part, with cycle times of 15 to 60 seconds versus hours per part for additive.

## How it works

Every additive process follows the same digital chain, even though the physics differ.

**1. Design.** Create a 3D model in CAD. Outputs typically use STL, 3MF, AMF, or STEP. 3MF and AMF retain more information than STL, such as color and material.

**2. Prepare.** Check and repair the mesh, choose orientation on the build plate, and add support structures where needed. Supports anchor the part, conduct heat away, and hold overhangs. NIST notes this is not push-button. On metal powder bed systems, surfaces under about 45 degrees to the plate usually need supports and users still make judgment calls.

**3. Slice and plan.** Software cuts the model into horizontal slices. Each slice becomes a toolpath or exposure pattern. For powder bed fusion this includes a scan strategy. For material extrusion this is G-code with layer height, speed, and temperature.

**4. Build.** The machine forms one layer at a time. A material extrusion head deposits molten filament. A vat system cures liquid resin with UV light. A powder bed system spreads powder then melts it with a laser or electron beam. A binder system jets liquid binder onto powder. A directed energy system feeds powder or wire into a melt pool. A sheet system bonds and cuts sheets. The NIST Engineering Laboratory documents these as the common layer formation methods.

**5. Post-process.** All additive parts need finishing. Remove supports and loose powder or resin, wash and cure when needed, then apply heat treatment, stress relief, hot isostatic pressing for metals, shot peening, or machining. This step affects mechanical properties and can add hours to the workflow.

### The seven process categories in ISO/ASTM 52900

The standard groups processes by how layers are formed. Market names such as FDM, FFF, SLA, SLS, DMLS, SLM, EBM, and PolyJet are narrower labels inside these categories.

| Category | Abbreviation | How it builds | Typical materials | Common labels you will see |
| --- | --- | --- | --- | --- |
| Binder jetting | BJT | Liquid bonding agent jetted onto powder to join particles | Sand, metals, ceramics, then sintered | Metal binder jetting, sand binder jetting |
| Directed energy deposition | DED | Focused thermal energy melts material as it is fed through a nozzle | Metal powder or wire, titanium, nickel alloys | Laser cladding, WAAM (wire arc) |
| Material extrusion | MEX | Material dispensed through a nozzle or orifice | PLA, PETG, ABS, ASA, nylon, TPU, carbon-filled, PEEK | FDM, FFF |
| Material jetting | MJT | Droplets of feedstock jetted and cured | Photopolymers, wax | PolyJet, MultiJet |
| Powder bed fusion | PBF | Thermal energy fuses regions of a powder bed | Nylon PA11/PA12 for polymers, Ti-6Al-4V, 316L, Inconel, aluminum for metals | SLS, MJF for polymers, DMLS, SLM, EBM for metals |
| Sheet lamination | SHL | Sheets bonded and cut to shape | Paper, plastic, metal foil | LOM, ultrasonic additive |
| Vat photopolymerization | VPP | Liquid photopolymer in a vat cured by light | Standard, tough, castable, biocompatible resins | SLA, DLP, LCD, mSLA |

Two points help choose:

*   Resolution versus speed. Thinner layers improve surface quality but increase build time in direct proportion. Vat systems give the finest detail for small parts. Material extrusion gives the lowest cost per part for functional prototypes.
*   Supports and reuse. Powder bed polymer systems need no supports for many shapes and reuse unfused powder. Metal powder bed and vat systems need supports and careful powder or resin handling. Binder jetting and material jetting trade detail and color for extra sintering or curing steps.

## Pros and cons

### Where additive helps

*   **Geometric freedom without new tooling.** Internal channels, lattices, and consolidated assemblies that cannot be molded or machined as one piece. Part count drops and assembly steps shrink.
*   **Customization at no tooling cost.** Each part can differ from the last with no mold change. This is why dental aligners and patient-specific guides already run at scale.
*   **Faster iteration.** First part in 1 to 3 days from a service bureau, versus 4 to 12 weeks for mold tooling. NIST Manufacturing Extension Partnership lists this as the most common benefit for small and mid-size manufacturers.
*   **Less waste than subtractive.** Material is placed where needed. For metals this avoids machining a large billet into a small part. Powders and resins still generate waste through supports, failed builds, and unused material that falls outside reuse specs.
*   **Distributed and on-demand supply.** Print spares close to the point of use. Field units and maintenance depots use this to avoid warehousing slow-moving parts.

### Where it falls short

*   **Speed per part.** A peer-reviewed benchmark in the International Journal of Precision Engineering and Manufacturing-Green Technology (Sungkyunkwan University, 2025) built a 30 mm cube. Injection molding with an 8-cavity mold did 1,920 parts per hour. The fastest additive workflow in that test, binder jetting in continuous mode, did 32 parts per hour after post-processing. Single-batch rates for MEX, VPP, and PBF were 4 to 8 parts per hour. Add mandatory washing, curing, depowdering, sintering, and cooling, which can add hours to days for metal binder systems.
*   **Cost per part at volume.** The same study found vat photopolymerization at $10.67 per part and powder bed fusion at $7.96 per part at assumed machine life and labor, versus injection molding falling to $0.97 per part at 100,000 identical units. Break-even for identical parts was about 10,263 units. If you need 50 variants of 200 parts each, additive kept a flat cost while injection needed 50 molds, which flips the math.
*   **Material cost and choice.** Filament is $20 to $50 per kilogram. Engineering nylons for SLS are about $100 per kilogram. Metal powders are $500 or more per kilogram. Vat resins are $50 to $150 per liter. Commodity injection pellets are $2 to $20 per kilogram. Additive gives fewer qualified production-grade options, especially for high-temperature or chemically resistant use.
*   **Surface finish, accuracy, and anisotropy.** Layer lines, stair stepping on angled faces, and directional properties are common. Tolerances and fatigue life often depend on orientation, parameters, and post-processing. NIST notes qualification remains a barrier for high-consequence parts such as flight hardware.
*   **Build volume and consistency.** Most desktop machines build around 220 to 256 mm per side. Larger industrial systems exist but cost more and heat slower. Machine-to-machine variation requires documented parameters and validation if you move production between sites.

## How to get started

**1. Define the job.** Write what the part must do, not how it is made. Size, tolerance, temperature, load, and quantity decide the process. A one-off jig needs different choices than a 5,000-unit end-use part.

**2. Build CAD skill.** Fusion 360, SolidWorks, Onshape, or free tools like Tinkercad for first models all export STL or 3MF. Take a design-for-additive course so you learn orientation, wall thickness, and support rules before you print.

**3. Choose a path: service bureau or own printer.**

*   Use a bureau for occasional needs, large parts, or metals. Plan $30 to $300 for small polymer parts, $500 and up for large or metal parts, per 2024 service pricing guides.
*   Buy a printer if you will print weekly. Entry FDM ($200 to $500) handles PLA and PETG for fixtures and prototypes. Mid-range enclosed CoreXY ($500 to $1,000) adds ABS, ASA, and better quality-of-life features such as auto bed leveling and runout sensors. Benchtop SLS starts under $30,000 for printer and depowdering. Metal powder bed or directed energy systems start near $200,000 and need facility controls.

**4. Match process to requirement.**

*   Functional prototypes and brackets: MEX with PETG or nylon.
*   Fine detail, dental models, jewelry patterns: VPP (SLA/DLP).
*   Strong nylon parts with complex shape and no supports: PBF-SLS or MJF with PA12.
*   Metal flight or implant hardware: PBF with Ti-6Al-4V or 316L, or binder jetting with sintering for higher volume.

**5. Budget for the real cost.** Count filament or powder, nozzles or tanks, isopropyl alcohol for vat, electricity, and failed prints. Store PETG, nylon, and other hygroscopic filaments in sealed boxes with desiccant. A filament dry box ($25 to $40) prevents bubbling and weak adhesion.

**6. Set up the workflow.** Install a slicer (Bambu Studio, PrusaSlicer, or OrcaSlicer, all free), start with manufacturer profiles, and print calibration parts first. Expect to adjust layer height, infill, and support density.

**7. Validate the output.** Measure critical dimensions, test strength in the printed orientation, and document settings that gave a good part. For production, run the same tests after any material or machine change.

**8. Iterate on design.** If supports scar the surface, reorient the part. If warping occurs on ABS, use an enclosure and brim. If throughput matters, add automation or run multiple printers rather than pushing one machine faster at the expense of quality.

## FAQ

**What is the difference between additive manufacturing and 3D printing?**
They describe the same joining process, but usage differs. Additive manufacturing is the formal term in ISO/ASTM 52900 for industrial production from 3D model data. 3D printing is the common term and often refers to desktop or consumer use. NIST uses both and notes that 3D printing is one approach to additive manufacturing.

**Which industries use additive most?**
Aerospace and defense, medical and dental, automotive, energy, tooling, and education. Aerospace uses it for lightweight ducts, brackets, and propulsion parts. Medical and dental use it for implants, guides, crowns, and aligners. Automotive uses it for prototyping, jigs, fixtures, and low-volume spares. NIST and AMPOWER list these as the largest adopters based on system sales and part production.

**Can it be used for mass production?**
Yes for specific cases, no as a direct replacement for high-volume molding. Additive keeps cost per part roughly steady across quantities, which helps for mass customization. Injection molding drops cost per part as volume rises. Peer-reviewed testing places break-even for identical simple parts near 10,000 units. Above that, molding is usually cheaper. Additive wins when you need many variants, frequent design changes, or no inventory. Dental aligners show how arrays of vat photopolymerization printers produce millions of unique parts per year even though each part is different.

**What materials can it use?**
Most families are available. Polymers: PLA ($20 to $25 per kg), PETG, ABS, ASA, nylon PA11/PA12, TPU, PEKK, carbon-filled grades. Photopolymers: standard, tough, flexible, castable, and biocompatible resins for vat systems. Metals: stainless 316L, titanium Ti-6Al-4V, Inconel 625/718, aluminum AlSi10Mg, cobalt-chrome, tool steels, often as fine powders. Ceramics, sand for molds, wax for patterns, and composites also run on specific processes.

**Do additive parts need post-processing?**
Almost always. Remove supports and powder or uncured resin, wash and cure, then add steps based on process. Polymers may need sanding or vapor smoothing. Metals often need stress relief, hot isostatic pressing, and machining of critical surfaces. NIST notes post-processing is tailored to material, geometry, and performance requirements and is essential for repeatability.

**How accurate are additive parts?**
Accuracy depends on process, material, layer height, and orientation. Well-tuned MEX and VPP machines hold around 0.1 to 0.2 mm for small features, with finer results on vat systems. SLS and MJF give more uniform accuracy for nylon, often within 0.15 mm. Metal PBF needs compensation for shrinkage and distortion and usually needs machining for tight tolerances. Always test with your printer and material.

**What file format should I export?**
Use 3MF when your toolchain supports it. It keeps units, color, and lattice data. Use STL if the recipient requires it, but check for mesh errors. STEP is useful when the next step is CAD editing rather than direct printing.
