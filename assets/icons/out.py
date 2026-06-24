import os

# Pasta onde o script está localizado
pasta = os.path.dirname(os.path.abspath(__file__))

# Extensões de imagem
extensoes = ('.png', '.jpg', '.jpeg', '.bmp', '.gif', '.webp', '.tif', '.tiff')

for arquivo in os.listdir(pasta):
    if arquivo.lower().endswith(extensoes) and "_rgb" in arquivo:
        novo_nome = arquivo.replace("_rgb", "")

        caminho_antigo = os.path.join(pasta, arquivo)
        caminho_novo = os.path.join(pasta, novo_nome)

        os.rename(caminho_antigo, caminho_novo)
        print(f"Renomeado: {arquivo} -> {novo_nome}")

print("Concluído!")