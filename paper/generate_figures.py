import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import numpy as np

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

C_BLUE = '#2c5f8a'
C_BLUE_LIGHT = '#6fa3d4'
C_TEAL = '#2a8b8b'
C_DARK = '#2c3e50'

# Figure 1: Point Allocation Across Components
def make_fig1():
    components = ['Active Roles\n(Volume)', 'Departments\n(Diversity)', 'Remote Work\n(Flexibility)', 'Salary Listed\n(Transparency)']
    points = [60, 20, 10, 10]
    
    fig, ax = plt.subplots(figsize=(5.5, 2.5))
    bars = ax.bar(components, points, color=[C_BLUE, C_BLUE_LIGHT, C_TEAL, '#4a90e2'], width=0.55, edgecolor='none')
    
    for bar in bars:
        height = bar.get_height()
        ax.text(bar.get_x() + bar.get_width() / 2.0, height + 1.2,
                f'{int(height)} pts', ha='center', va='bottom', fontsize=9, fontweight='bold', color=C_DARK)
        
    ax.set_ylim(0, 72)
    ax.set_ylabel('Maximum Points')
    fig.savefig('/Users/vedang/.gemini/antigravity/scratch/Web3-Jobs/paper/figure1_points.png')
    plt.close(fig)

# Figure 2: Sector Distribution
def make_fig2():
    sectors = [
        'Exchanges', 'Fintech', 'Trading', 'Security', 'AI DePIN',
        'DeFi', 'Venture', 'Infra', 'L1 L2', 'Prediction', 'Web3 Infra'
    ]
    shares = [35.2, 20.6, 10.2, 8.7, 8.1, 5.2, 3.7, 3.5, 3.0, 1.2, 0.7]
    
    fig, ax = plt.subplots(figsize=(5.5, 2.8))
    x = np.arange(len(sectors))
    bars = ax.bar(x, shares, color=C_BLUE, width=0.6, edgecolor='none')
    
    for bar in bars:
        h = bar.get_height()
        ax.text(bar.get_x() + bar.get_width() / 2.0, h + 0.6,
                f'{h:.1f}%', ha='center', va='bottom', fontsize=8, color=C_DARK)
        
    ax.set_xticks(x)
    ax.set_xticklabels(sectors, rotation=35, ha='right')
    ax.set_ylim(0, 42)
    ax.set_ylabel('Share of Open Roles (Percent)')
    fig.savefig('/Users/vedang/.gemini/antigravity/scratch/Web3-Jobs/paper/figure2_sectors.png')
    plt.close(fig)

# Figure 3: Remote Availability
def make_fig3():
    sectors = [
        'Infra', 'Security', 'Web3 Infra', 'DeFi', 'AI DePIN',
        'Exchanges', 'L1 L2', 'Fintech', 'Prediction', 'Trading', 'Venture'
    ]
    rates = [77, 76, 50, 43, 42, 42, 39, 33, 23, 6, 5]
    
    fig, ax = plt.subplots(figsize=(5.5, 2.8))
    x = np.arange(len(sectors))
    colors = [C_TEAL if r >= 50 else (C_BLUE if r >= 30 else '#d9534f') for r in rates]
    bars = ax.bar(x, rates, color=colors, width=0.6, edgecolor='none')
    
    for bar in bars:
        h = bar.get_height()
        ax.text(bar.get_x() + bar.get_width() / 2.0, h + 1.2,
                f'{int(h)}%', ha='center', va='bottom', fontsize=8, color=C_DARK)
        
    ax.set_xticks(x)
    ax.set_xticklabels(sectors, rotation=35, ha='right')
    ax.set_ylim(0, 90)
    ax.set_ylabel('Remote Listings Share (Percent)')
    fig.savefig('/Users/vedang/.gemini/antigravity/scratch/Web3-Jobs/paper/figure3_remote.png')
    plt.close(fig)

if __name__ == '__main__':
    make_fig1()
    make_fig2()
    make_fig3()
    print('Generated all figures successfully.')
