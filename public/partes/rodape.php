<?php
    $script = $script ?? "js/main.js";
?>
    </main>

    <footer class="rodape">
        Retifica Parana / Campo Mourao &middot; dashboard interna &middot; <?= date("Y") ?>
    </footer>

    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>
    <script type="module" src="<?= $script ?>"></script>
</body>

</html>
