with open('content/articles/what-is-a-reputation-system-in-web3.md', 'r') as f:
    text = f.read()

text = text.replace('financial leverage', 'financial capital access')
text.replace('labor platforms leverage reputation', 'labor platforms utilize reputation')
text = text.replace('labor platforms leverage reputation', 'labor platforms utilize reputation')

with open('content/articles/what-is-a-reputation-system-in-web3.md', 'w') as f:
    f.write(text)
