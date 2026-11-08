import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import numpy as np
from matplotlib.patches import FancyBboxPatch

plt.rcParams.update({
    'font.family': 'serif',
    'font.serif': ['Times New Roman', 'DejaVu Serif'],
    'font.size': 9,
    'axes.labelsize': 9.5,
    'xtick.labelsize': 8.5,
    'ytick.labelsize': 8.5,
    'figure.dpi': 300,
    'savefig.dpi': 300,
    'savefig.bbox': 'tight',
    'axes.spines.top': False,
    'axes.spines.right': False,
})

C_NAVY = '#1e3a8a'
C_BLUE = '#2563eb'
C_TEAL = '#0f766e'
C_SLATE = '#334155'
C_GRAY_BG = '#f8fafc'
C_BORDER = '#94a3b8'
C_RED = '#b91c1c'

# Figure 1: Pipeline Flowchart (Generous padding, clean cards, no text clipping)
def make_fig1_pipeline():
    fig, ax = plt.subplots(figsize=(6.8, 2.6), dpi=300)
    ax.axis('off')
    
    steps = [
        ('1. Primary Ingestion', 'Greenhouse, Ashby\nLever, Workable\nTeamtailor feeds'),
        ('2. Normalization', 'Multi-city dedup\nCanonical titles\nStale URL pruning'),
        ('3. Web3 Audit', 'Native digital assets\nProtocol teams\nFintech exclusion'),
        ('4. Scoring Engine', 'Volume (60 pts)\nDiversity (20 pts)\nRemote (10 pts)\nSalary (10 pts)'),
        ('5. Live Publication', 'hashtagweb3.com\nTop 100 ranking\nRegular updates')
    ]
    
    n = len(steps)
    box_w = 1.15
    box_h = 1.45
    spacing = 1.30
    y_center = 0.82
    
    for i, (title, desc) in enumerate(steps):
        x = i * spacing + 0.06
        box = FancyBboxPatch((x, y_center - box_h/2), box_w, box_h,
                             boxstyle='round,pad=0.03,rounding_size=0.07',
                             facecolor=C_GRAY_BG, edgecolor=C_NAVY if i in (0, 3, 4) else C_BORDER,
                             linewidth=1.3)
        ax.add_patch(box)
        
        # Step Title
        ax.text(x + box_w/2, y_center + 0.44, title, ha='center', va='center',
                fontsize=7.8, fontweight='bold', color=C_NAVY)
        # Inner subtle divider
        ax.plot([x + 0.12, x + box_w - 0.12], [y_center + 0.27, y_center + 0.27], color='#cbd5e1', lw=0.6)
        # Step Description
        ax.text(x + box_w/2, y_center - 0.19, desc, ha='center', va='center',
                fontsize=6.8, color=C_SLATE, linespacing=1.35)
        
        # Arrow connecting steps
        if i < n - 1:
            ax.annotate('', xy=(x + box_w + 0.12, y_center), xytext=(x + box_w + 0.03, y_center),
                        arrowprops=dict(arrowstyle='->', color=C_BLUE, lw=1.4))
            
    ax.set_xlim(-0.02, (n - 1) * spacing + box_w + 0.12)
    ax.set_ylim(0.0, 1.65)
    fig.savefig('/Users/vedang/.gemini/antigravity/scratch/Web3-Jobs/paper/figure1_pipeline.png', bbox_inches='tight')
    plt.close(fig)

# Figure 2: Point Allocation
def make_fig2_points():
    components = ['Active Roles\n(Volume)', 'Departments\n(Diversity)', 'Remote Work\n(Flexibility)', 'Salary Listed\n(Transparency)']
    points = [60, 20, 10, 10]
    
    fig, ax = plt.subplots(figsize=(5.5, 2.4), dpi=300)
    bars = ax.bar(components, points, color=[C_NAVY, C_BLUE, C_TEAL, '#38bdf8'], width=0.52, edgecolor='none')
    
    for bar in bars:
        h = bar.get_height()
        ax.text(bar.get_x() + bar.get_width()/2.0, h + 1.2,
                f'{int(h)} pts', ha='center', va='bottom', fontsize=8.5, fontweight='bold', color=C_SLATE)
        
    ax.set_ylim(0, 75)
    ax.set_ylabel('Maximum Points')
    fig.savefig('/Users/vedang/.gemini/antigravity/scratch/Web3-Jobs/paper/figure2_points.png', bbox_inches='tight')
    plt.close(fig)

# Figure 3: Logarithmic Scoring Curve vs Linear Model
def make_fig3_curve():
    jobs = np.arange(1, 76)
    v_log = 60.0 * np.log(1.0 + jobs) / np.log(1.0 + 75.0)
    v_lin = 60.0 * (jobs / 75.0)
    
    fig, ax = plt.subplots(figsize=(5.5, 2.5), dpi=300)
    ax.plot(jobs, v_log, label='Hashtag Web3 Logarithmic Model', color=C_NAVY, lw=2.0)
    ax.plot(jobs, v_lin, label='Uncalibrated Linear Scaling', color='#94a3b8', lw=1.5, ls='--')
    
    # Highlight specific points
    points_to_mark = [2, 10, 24, 46, 75]
    for j in points_to_mark:
        score = 60.0 * np.log(1.0 + j) / np.log(1.0 + 75.0)
        ax.plot(j, score, 'o', color=C_TEAL, markersize=4.5)
        offset_x = 1.5 if j < 70 else -18.0
        offset_y = -3.0 if j < 70 else 2.0
        ax.text(j + offset_x, score + offset_y, f'{j}j = {score:.1f}p', fontsize=7.2, color=C_SLATE)
        
    ax.set_xlabel('Verified Active Jobs')
    ax.set_ylabel('Volume Score (Points)')
    ax.set_xlim(0, 82)
    ax.set_ylim(0, 72)
    ax.legend(loc='lower right', frameon=False, fontsize=8)
    fig.savefig('/Users/vedang/.gemini/antigravity/scratch/Web3-Jobs/paper/figure3_curve.png', bbox_inches='tight')
    plt.close(fig)

# Figure 4: Headcount Concentration
def make_fig4_concentration():
    tiers = ['Top 10\nEmployers', 'Top 25\nEmployers', 'Top 50\nEmployers', 'Top 100\nEmployers']
    jobs_cum = [388, 640, 861, 1115]
    pct_cum = [34.8, 57.4, 77.2, 100.0]
    
    fig, ax = plt.subplots(figsize=(5.5, 2.5), dpi=300)
    x = np.arange(len(tiers))
    bars = ax.bar(x, pct_cum, color=[C_NAVY, C_BLUE, C_TEAL, '#64748b'], width=0.5, edgecolor='none')
    
    for i, bar in enumerate(bars):
        h = bar.get_height()
        ax.text(bar.get_x() + bar.get_width()/2.0, h + 1.8,
                f'{h:.1f}%\n({jobs_cum[i]} jobs)', ha='center', va='bottom', fontsize=8, color=C_SLATE)
        
    ax.set_xticks(x)
    ax.set_xticklabels(tiers)
    ax.set_ylim(0, 125)
    ax.set_ylabel('Cumulative Share of Open Roles (Percent)')
    fig.savefig('/Users/vedang/.gemini/antigravity/scratch/Web3-Jobs/paper/figure4_concentration.png', bbox_inches='tight')
    plt.close(fig)

# Figure 5: Sector Breakdown
def make_fig5_sectors():
    sectors = [
        'Exchanges', 'Fintech', 'Trading', 'Security', 'AI DePIN',
        'DeFi', 'Venture', 'Infra', 'L1 L2', 'Prediction', 'Web3 Infra'
    ]
    shares = [35.2, 20.6, 10.2, 8.7, 8.1, 5.2, 3.7, 3.5, 3.0, 1.2, 0.7]
    
    fig, ax = plt.subplots(figsize=(5.5, 2.7), dpi=300)
    x = np.arange(len(sectors))
    bars = ax.bar(x, shares, color=C_NAVY, width=0.6, edgecolor='none')
    
    for bar in bars:
        h = bar.get_height()
        ax.text(bar.get_x() + bar.get_width()/2.0, h + 0.6,
                f'{h:.1f}%', ha='center', va='bottom', fontsize=7.5, color=C_SLATE)
        
    ax.set_xticks(x)
    ax.set_xticklabels(sectors, rotation=35, ha='right')
    ax.set_ylim(0, 44)
    ax.set_ylabel('Share of Open Roles (Percent)')
    fig.savefig('/Users/vedang/.gemini/antigravity/scratch/Web3-Jobs/paper/figure5_sectors.png', bbox_inches='tight')
    plt.close(fig)

# Figure 6: Remote Availability
def make_fig6_remote():
    sectors = [
        'Infra', 'Security', 'Web3 Infra', 'DeFi', 'AI DePIN',
        'Exchanges', 'L1 L2', 'Fintech', 'Prediction', 'Trading', 'Venture'
    ]
    rates = [77, 76, 50, 43, 42, 42, 39, 33, 23, 6, 5]
    
    fig, ax = plt.subplots(figsize=(5.5, 2.7), dpi=300)
    x = np.arange(len(sectors))
    colors = [C_TEAL if r >= 50 else (C_BLUE if r >= 30 else C_RED) for r in rates]
    bars = ax.bar(x, rates, color=colors, width=0.6, edgecolor='none')
    
    for bar in bars:
        h = bar.get_height()
        ax.text(bar.get_x() + bar.get_width()/2.0, h + 1.5,
                f'{int(h)}%', ha='center', va='bottom', fontsize=7.5, color=C_SLATE)
        
    ax.set_xticks(x)
    ax.set_xticklabels(sectors, rotation=35, ha='right')
    ax.set_ylim(0, 96)
    ax.set_ylabel('Remote Job Share (Percent)')
    fig.savefig('/Users/vedang/.gemini/antigravity/scratch/Web3-Jobs/paper/figure6_remote.png', bbox_inches='tight')
    plt.close(fig)

if __name__ == '__main__':
    make_fig1_pipeline()
    make_fig2_points()
    make_fig3_curve()
    make_fig4_concentration()
    make_fig5_sectors()
    make_fig6_remote()
    print('Generated all 6 consulting figures cleanly.')
