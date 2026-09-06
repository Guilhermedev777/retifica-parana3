<?php
    $titulo = $titulo ?? "Controle de pecas";
    $pagina = $pagina ?? "index";
?>
<!DOCTYPE html>
<html lang="pt-BR">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title><?= $titulo ?> | Retifica Parana</title>

    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">

    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500;600&family=IBM+Plex+Sans+Condensed:wght@500;600;700&family=IBM+Plex+Sans:wght@400;500;600&display=swap" rel="stylesheet">

    <link href="assets/css/estilo.css" rel="stylesheet">
</head>

<body>
    <nav class="navbar barra">
        <div class="container-fluid barra__interno">
            <a class="navbar-brand barra__marca" href="index.php">
                <img src="assets/img/logo-retifica-parana.png" alt="Retifica Parana" height="34">
            </a>

            <ul class="nav barra__menu">
                <li class="nav-item">
                    <a class="nav-link barra__link <?= ($pagina == "index") ? "barra__link--ativo" : "" ?>" href="index.php">Dashboard</a>
                </li>
                <li class="nav-item">
                    <a class="nav-link barra__link <?= ($pagina == "cadastro") ? "barra__link--ativo" : "" ?>" href="cadastro.php">Cadastros</a>
                </li>
            </ul>

            <div class="barra__acao">
                <?php if ($pagina == "index") { ?>
                    <span class="carimbo" id="carimbo">carregando</span>
                    <button class="btn botao-atualizar" id="botaoAtualizar" type="button">Atualizar leitura</button>
                <?php } else { ?>
                    <a class="btn botao-atualizar" href="index.php">Voltar para a dashboard</a>
                <?php } ?>
            </div>
        </div>
    </nav>

    <main class="container-fluid conteudo">
