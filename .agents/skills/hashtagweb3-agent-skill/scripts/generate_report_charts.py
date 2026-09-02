import os
import numpy as np
import matplotlib.pyplot as plt
import matplotlib.patches as patches

# Setup clean, flat, modern minimalist aesthetic parameters for matplotlib
plt.rcParams['font.family'] = 'sans-serif'
plt.rcParams['font.sans-serif'] = ['Helvetica', 'Arial', 'DejaVu Sans', 'Liberation Sans']
plt.rcParams['text.color'] = '#18181B'        # Zinc-900 (deep charcoal) for all text
plt.rcParams['axes.labelcolor'] = '#71717A'    # Zinc-500 (muted gray) for labels
plt.rcParams['xtick.color'] = '#71717A'
plt.rcParams['ytick.color'] = '#71717A'
plt.rcParams['grid.color'] = '#E4E4E7'         # Zinc-200 for clean light grids

# Define flat brand colors strictly matching the repository's globals.css & web3-hiring-report
BG_COLOR = '#FFFFFF'          # Clean white backdrop matching pages
CARD_BG = '#FFFFFF'
TEXT_DARK = '#18181B'         # Zinc-900
TEXT_MUTED = '#71717A'        # Zinc-500
BORDER_COLOR = '#E4E4E7'      # Zinc-200 thin border line

COLOR_PRIMARY = '#216B9B'     # Brand Primary HSL(205, 71%, 45%) - elegant blue
COLOR_ACCENT = '#3A92CC'      # Brand Accent HSL(205, 71%, 55%) - light blue
COLOR_CVINBIO = '#18181B'     # Clean brand black
COLOR_WEB3 = '#6366F1'        # Indigo-500 brand accent from playbooks
COLOR_LIGHT_BG = '#FAFABA'     # Zinc-50 soft gray-white

def create_conversion_funnel():
    """Generates a highly elegant, flat, light-mode minimalist conversion funnel chart."""
    fig, ax = plt.subplots(figsize=(10, 6.2), facecolor=BG_COLOR)
    ax.set_facecolor(BG_COLOR)

    # Data
    stages = [
        "Unique Visitors",
        "Profile Viewed",
        "Job Clicked",
        "Upload Started",
        "Upload Completed"
    ]
    values = [1519, 725, 719, 337, 301]
    percentages = [100.0, 47.7, 47.3, 22.2, 19.8]
    
    # Elegant, clean primary/secondary theme colors matching repo page design
    colors = [COLOR_PRIMARY, '#257BB3', '#2A8BC4', COLOR_ACCENT, '#5FA8D3']
    
    y_pos = np.arange(len(stages))[::-1]  # reverse order so top is first
    
    # Calculate widths centered around 0
    max_val = max(values)
    widths = [v / max_val * 8 for v in values]  # scale to fit elegantly
    lefts = [(10 - w) / 2 for w in widths]
    
    # Plot horizontal bars with thin, clean dark borders instead of neon gradients
    bars = ax.barh(y_pos, widths, left=lefts, height=0.5, color=colors, edgecolor='#FFFFFF', linewidth=1)
    
    # Hide axes spines and ticks to maintain editorial cleanliness
    for name, spine in ax.spines.items():
        spine.set_visible(False)
    ax.xaxis.set_visible(False)
    ax.set_yticks([])
    
    # Add title and subtitle with precise, clean weight
    ax.text(5, len(stages) - 0.2, "CV in Bio Conversion Funnel", 
            ha='center', va='bottom', fontsize=18, fontweight='bold', color=TEXT_DARK)
    ax.text(5, len(stages) - 0.5, "Traffic & Key Engagement Metrics (Last 30 Days)", 
            ha='center', va='bottom', fontsize=11, color=TEXT_MUTED)

    # Draw minimal, clean vertical connecting lines between steps to show funnel flow
    for i in range(len(stages) - 1):
        y1 = y_pos[i] + 0.25
        y2 = y_pos[i+1] - 0.25
        
        x1_l = lefts[i]
        x1_r = lefts[i] + widths[i]
        x2_l = lefts[i+1]
        x2_r = lefts[i+1] + widths[i+1]
        
        # Connect left and right ends with subtle, thin dashed lines instead of AI slop fills
        ax.plot([x1_l, x2_l], [y1, y2], color=BORDER_COLOR, linestyle='--', linewidth=1)
        ax.plot([x1_r, x2_r], [y1, y2], color=BORDER_COLOR, linestyle='--', linewidth=1)

    # Add text labels on and around the bars
    for i, (bar, val, pct, stage) in enumerate(zip(bars, values, percentages, stages)):
        y = bar.get_y() + bar.get_height() / 2
        
        # Draw central stage text
        spaced_stage = "  ".join(list(stage.upper()))
        ax.text(5, y + 0.32, spaced_stage, ha='center', va='center', 
                fontsize=8.5, fontweight='bold', color=TEXT_MUTED)
        
        # Central value display
        val_text = f"{val:,}"
        pct_text = f"{pct:.1f}%"
        ax.text(5, y, f"{val_text}  •  {pct_text}", ha='center', va='center', 
                fontsize=11.5, fontweight='bold', color=TEXT_DARK)
        
        # Draw step badges on the left side
        step_num = f"STAGE {i+1}"
        ax.text(0.5, y, step_num, ha='left', va='center', fontsize=8.5, fontweight='bold', color=TEXT_MUTED)
        
        # Draw key transition metrics on the right side
        if i == 4: # Upload complete stage
            ax.text(9.5, y, "89.3% Upload Conv. Rate", ha='right', va='center', 
                    fontsize=9.5, fontweight='bold', color='#10B981')
        elif i == 1:
            ax.text(9.5, y, "47.7% Profile View Rate", ha='right', va='center', 
                    fontsize=8.5, color=TEXT_MUTED)
        elif i == 2:
            ax.text(9.5, y, "47.3% Job Click Rate", ha='right', va='center', 
                    fontsize=8.5, color=TEXT_MUTED)

    # Adjust limits and padding
    ax.set_xlim(0, 10)
    ax.set_ylim(-0.8, len(stages) + 0.6)
    
    plt.tight_layout()
    os.makedirs("/Users/vedang/.gemini/antigravity/brain/a953b8fa-3e99-4aca-a494-6da238a4bab2/artifacts", exist_ok=True)
    out_path = "/Users/vedang/.gemini/antigravity/brain/a953b8fa-3e99-4aca-a494-6da238a4bab2/artifacts/conversion_funnel_chart_1779522575123.png"
    plt.savefig(out_path, dpi=300, facecolor=BG_COLOR, edgecolor='none')
    plt.close()
    print(f"Funnel chart saved successfully to {out_path}")

def create_comparison_dashboard():
    """Generates an ultra-minimalist, flat, light-mode side-by-side comparative dashboard."""
    fig = plt.figure(figsize=(14, 10.5), facecolor=BG_COLOR)
    
    # 2x2 grid layout
    gs = fig.add_gridspec(2, 2, hspace=0.35, wspace=0.25)
    
    # Overall Title with elegant editorial sizing
    fig.text(0.5, 0.965, "Database Analytics & Platform Comparison", 
             ha='center', va='top', fontsize=20, fontweight='bold', color=TEXT_DARK)
    fig.text(0.5, 0.935, "CV in Bio vs Hashtag Web3 (Complete Listings Audit)", 
             ha='center', va='top', fontsize=11, color=TEXT_MUTED)

    width = 0.35

    # ------------------ SUBPLOT 1: Total Volume Comparison ------------------
    ax1 = fig.add_subplot(gs[0, 0])
    ax1.set_facecolor(CARD_BG)
    
    categories = ['Total Listings', 'Unique Companies']
    cvinbio_vals = [45342, 2052]
    web3_vals = [2736, 165]
    
    x = np.arange(len(categories))
    
    # Log scale is required due to large volume difference
    ax1.set_yscale('log')
    
    rects1 = ax1.bar(x - width/2, cvinbio_vals, width, label='CV in Bio', color=COLOR_PRIMARY, edgecolor='none')
    rects2 = ax1.bar(x + width/2, web3_vals, width, label='Hashtag Web3', color=COLOR_WEB3, edgecolor='none')
    
    ax1.set_title("Listing & Employer Volume (Log Scale)", pad=15, fontsize=12, fontweight='bold', color=TEXT_DARK)
    ax1.set_xticks(x)
    ax1.set_xticklabels(categories, fontsize=9.5, fontweight='bold')
    ax1.grid(True, which="both", ls="--", alpha=0.15)
    
    # Add values on top of bars
    for rect in rects1:
        h = rect.get_height()
        ax1.annotate(f"{h:,}",
                    xy=(rect.get_x() + rect.get_width() / 2, h),
                    xytext=(0, 4),
                    textcoords="offset points",
                    ha='center', va='bottom', fontsize=9, fontweight='bold', color=TEXT_DARK)
                    
    for rect in rects2:
        h = rect.get_height()
        ax1.annotate(f"{h:,}",
                    xy=(rect.get_x() + rect.get_width() / 2, h),
                    xytext=(0, 4),
                    textcoords="offset points",
                    ha='center', va='bottom', fontsize=9, fontweight='bold', color=TEXT_DARK)
                    
    ax1.legend(frameon=True, facecolor=BG_COLOR, edgecolor=BORDER_COLOR)
    
    # ------------------ SUBPLOT 2: Work Environment ------------------
    ax2 = fig.add_subplot(gs[0, 1])
    ax2.set_facecolor(CARD_BG)
    
    env_labels = ['Fully Remote', 'Hybrid', 'On-site']
    cvinbio_env = [12.9, 0.6, 86.5]
    web3_env = [39.4, 13.5, 39.0]
    
    x = np.arange(len(env_labels))
    
    rects1 = ax2.bar(x - width/2, cvinbio_env, width, label='CV in Bio', color=COLOR_PRIMARY, edgecolor='none')
    rects2 = ax2.bar(x + width/2, web3_env, width, label='Hashtag Web3', color=COLOR_WEB3, edgecolor='none')
    
    ax2.set_title("Work Environment Distribution (%)", pad=15, fontsize=12, fontweight='bold', color=TEXT_DARK)
    ax2.set_xticks(x)
    ax2.set_xticklabels(env_labels, fontsize=9.5, fontweight='bold')
    ax2.set_ylim(0, 100)
    ax2.grid(True, ls="--", alpha=0.15)
    
    for rect in rects1:
        h = rect.get_height()
        ax2.annotate(f"{h:.1f}%",
                    xy=(rect.get_x() + rect.get_width() / 2, h),
                    xytext=(0, 3),
                    textcoords="offset points",
                    ha='center', va='bottom', fontsize=8.5, color=TEXT_MUTED)
                    
    for rect in rects2:
        h = rect.get_height()
        ax2.annotate(f"{h:.1f}%",
                    xy=(rect.get_x() + rect.get_width() / 2, h),
                    xytext=(0, 3),
                    textcoords="offset points",
                    ha='center', va='bottom', fontsize=8.5, color=TEXT_MUTED)
                    
    ax2.legend(frameon=True, facecolor=BG_COLOR, edgecolor=BORDER_COLOR)

    # ------------------ SUBPLOT 3: Seniority Distribution ------------------
    ax3 = fig.add_subplot(gs[1, 0])
    ax3.set_facecolor(CARD_BG)
    
    seniority = ['Senior', 'Mid', 'Junior']
    cvinbio_sen = [59.6, 34.0, 6.4]
    web3_sen = [49.9, 15.4, 6.5]
    
    x = np.arange(len(seniority))
    width_sen = 0.35
    
    rects1 = ax3.bar(x - width_sen/2, cvinbio_sen, width_sen, label='CV in Bio', color=COLOR_PRIMARY, edgecolor='none')
    rects2 = ax3.bar(x + width_sen/2, web3_sen, width_sen, label='Hashtag Web3', color=COLOR_WEB3, edgecolor='none')
    
    ax3.set_title("Seniority & Experience Level (%)", pad=15, fontsize=12, fontweight='bold', color=TEXT_DARK)
    ax3.set_xticks(x)
    ax3.set_xticklabels(seniority, fontsize=9.5, fontweight='bold')
    ax3.set_ylim(0, 70)
    ax3.grid(True, ls="--", alpha=0.15)
    
    for rect in rects1:
        h = rect.get_height()
        if h > 0:
            ax3.annotate(f"{h:.1f}%",
                        xy=(rect.get_x() + rect.get_width() / 2, h),
                        xytext=(0, 3),
                        textcoords="offset points",
                        ha='center', va='bottom', fontsize=8, color=TEXT_MUTED)
                    
    for rect in rects2:
        h = rect.get_height()
        if h > 0:
            ax3.annotate(f"{h:.1f}%",
                        xy=(rect.get_x() + rect.get_width() / 2, h),
                        xytext=(0, 3),
                        textcoords="offset points",
                        ha='center', va='bottom', fontsize=8, color=TEXT_MUTED)
                    
    ax3.legend(frameon=True, facecolor=BG_COLOR, edgecolor=BORDER_COLOR)

    # ------------------ SUBPLOT 4: Data Quality Comparison ------------------
    ax4 = fig.add_subplot(gs[1, 1])
    ax4.set_facecolor(CARD_BG)
    
    quality_labels = ['Disclosed Salary', 'Required Skills listed']
    cvinbio_qual = [14.8, 79.8]
    web3_qual = [5.1, 100.0]
    
    x = np.arange(len(quality_labels))
    
    rects1 = ax4.bar(x - width/2, cvinbio_qual, width, label='CV in Bio', color=COLOR_PRIMARY, edgecolor='none')
    rects2 = ax4.bar(x + width/2, web3_qual, width, label='Hashtag Web3', color=COLOR_WEB3, edgecolor='none')
    
    ax4.set_title("Data Completeness & Transparency (%)", pad=15, fontsize=12, fontweight='bold', color=TEXT_DARK)
    ax4.set_xticks(x)
    ax4.set_xticklabels(quality_labels, fontsize=9.5, fontweight='bold')
    ax4.set_ylim(0, 115)
    ax4.grid(True, ls="--", alpha=0.15)
    
    for rect in rects1:
        h = rect.get_height()
        ax4.annotate(f"{h:.1f}%",
                    xy=(rect.get_x() + rect.get_width() / 2, h),
                    xytext=(0, 3),
                    textcoords="offset points",
                    ha='center', va='bottom', fontsize=9, fontweight='bold', color=TEXT_DARK)
                    
    for rect in rects2:
        h = rect.get_height()
        ax4.annotate(f"{h:.1f}%",
                    xy=(rect.get_x() + rect.get_width() / 2, h),
                    xytext=(0, 3),
                    textcoords="offset points",
                    ha='center', va='bottom', fontsize=9, fontweight='bold', color=TEXT_DARK)
                    
    ax4.legend(frameon=True, facecolor=BG_COLOR, edgecolor=BORDER_COLOR)

    # Clean axes design for subplots
    for ax in [ax1, ax2, ax3, ax4]:
        # Hide standard top and right spines, and make left spine subtle
        for name, spine in ax.spines.items():
            if name in ['top', 'right', 'left']:
                spine.set_visible(False)
            else:
                spine.set_color(BORDER_COLOR)
                spine.set_linewidth(1)
        ax.tick_params(colors=TEXT_MUTED, width=1, labelsize=9)
        
    # Automatically align layout leaving room for titles
    fig.tight_layout(rect=[0, 0, 1, 0.90])
    
    out_path = "/Users/vedang/.gemini/antigravity/brain/a953b8fa-3e99-4aca-a494-6da238a4bab2/artifacts/metrics_dashboard_chart_1779522553684.png"
    plt.savefig(out_path, dpi=300, facecolor=BG_COLOR, edgecolor='none')
    plt.close()
    print(f"Comparison dashboard saved successfully to {out_path}")

if __name__ == "__main__":
    create_conversion_funnel()
    create_comparison_dashboard()
