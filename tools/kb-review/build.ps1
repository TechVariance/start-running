# Gera o formulário de revisão científica das KBs (KB_RUN_SR + KB_MUSC_SR).
#
# Lê as bases canônicas do repositório e embute o conteúdo atual dentro de uma
# página autocontida, para que o profissional contratado revise cada registro
# vendo exatamente o que está no repositório hoje.
#
#   powershell -ExecutionPolicy Bypass -File tools\kb-review\build.ps1
#
# Saída: tools\kb-review-form.html
#
# Está em PowerShell, e não em JS como o resto do projeto, porque é uma tarefa de
# operação rodada em máquina Windows: assim regenera sem depender de Bun/Node
# instalado. Rode de novo sempre que as KBs mudarem — a página é derivada.

$ErrorActionPreference = 'Stop'

$Here = Split-Path -Parent $MyInvocation.MyCommand.Path
$Root = Resolve-Path (Join-Path $Here '..\..')
$Out  = Join-Path $Here '..\kb-review-form.html'

# --------------------------------------------------------------- parsers

function Remove-Quotes([string]$s) {
    $t = $s.Trim()
    if ($t.Length -gt 1) {
        if (($t.StartsWith('"') -and $t.EndsWith('"')) -or ($t.StartsWith("'") -and $t.EndsWith("'"))) {
            return $t.Substring(1, $t.Length - 2)
        }
    }
    return $t
}

# YAML plano usado pelos registros de evidência: chaves de primeiro nível, arrays
# em flow (`[a, b]`) ou em bloco (`  - item`).
#
# $SingleValueKeys recebe as chaves cujo flow deve ser lido como UM item só.
# Necessário porque 4 registros BM-* gravaram `limitations: [Frase com, vírgula.]`
# — YAML estrito quebraria a frase em dois itens sem sentido. A exportação da
# página devolve esse campo em bloco, o que elimina a ambiguidade.
function ConvertFrom-FlatYaml {
    param([string]$Text, [string[]]$SingleValueKeys = @())

    $out = [ordered]@{}
    $key = $null

    foreach ($line in [regex]::Split($Text, "\r?\n")) {
        $trimmed = $line.Trim()
        if ($trimmed -eq '' -or $trimmed.StartsWith('#')) { continue }

        $item = [regex]::Match($line, '^\s+-\s+(.*)$')
        if ($item.Success -and $key) {
            if ($out[$key] -isnot [System.Collections.ArrayList]) {
                $out[$key] = New-Object System.Collections.ArrayList
            }
            [void]$out[$key].Add((Remove-Quotes $item.Groups[1].Value))
            continue
        }

        $kv = [regex]::Match($line, '^([A-Za-z_][A-Za-z0-9_]*):\s*(.*)$')
        if (-not $kv.Success) { continue }

        $key = $kv.Groups[1].Value
        $raw = $kv.Groups[2].Value.Trim()

        if ($raw -eq '') {
            $out[$key] = New-Object System.Collections.ArrayList
        }
        elseif ($raw.StartsWith('[') -and $raw.EndsWith(']')) {
            $inner = $raw.Substring(1, $raw.Length - 2).Trim()
            $list = New-Object System.Collections.ArrayList
            if ($inner -ne '') {
                if ($SingleValueKeys -contains $key) {
                    [void]$list.Add((Remove-Quotes $inner))
                }
                else {
                    foreach ($p in $inner.Split(',')) {
                        $v = Remove-Quotes $p
                        if ($v -ne '') { [void]$list.Add($v) }
                    }
                }
            }
            $out[$key] = $list
        }
        else {
            $out[$key] = Remove-Quotes $raw
        }
    }
    return $out
}

function Read-Jsonl([string]$Path) {
    $rows = New-Object System.Collections.ArrayList
    $i = 0
    foreach ($line in [regex]::Split([System.IO.File]::ReadAllText($Path), "\r?\n")) {
        $i++
        if ($line.Trim() -eq '') { continue }
        try { [void]$rows.Add(($line | ConvertFrom-Json)) }
        catch { throw ((Split-Path -Leaf $Path) + ' linha ' + $i + ': JSON invalido - ' + $_.Exception.Message) }
    }
    return $rows
}

function Read-Md([string]$KbDir, [string]$Rel) {
    $p = Join-Path $KbDir $Rel
    if (-not (Test-Path $p)) { return $null }
    $body = ([System.IO.File]::ReadAllText($p)).Trim()
    $first = [regex]::Split($body, "\r?\n") | Where-Object { $_.StartsWith('#') } | Select-Object -First 1
    $title = if ($first) { ($first -replace '^#+\s*', '') } else { $Rel }
    return [ordered]@{ path = $Rel; title = $title; body = $body }
}

function Read-DirMd([string]$KbDir, [string]$Rel) {
    $dir = Join-Path $KbDir $Rel
    $list = New-Object System.Collections.ArrayList
    if (-not (Test-Path $dir)) { return $list }
    foreach ($f in (Get-ChildItem -Path $dir -Filter *.md | Sort-Object Name)) {
        $m = Read-Md $KbDir "$Rel/$($f.Name)"
        if ($m) { [void]$list.Add($m) }
    }
    return $list
}

# -------------------------------------------------------------- montagem

function Get-Vocab($Records, [string]$Field) {
    $set = New-Object System.Collections.Generic.HashSet[string]
    foreach ($r in $Records) {
        if ($r[$Field]) { foreach ($v in $r[$Field]) { [void]$set.Add([string]$v) } }
    }
    $sorted = New-Object System.Collections.ArrayList
    foreach ($v in ($set | Sort-Object)) { [void]$sorted.Add($v) }
    return $sorted
}

function Import-Kb {
    param($Spec)

    $kbDir = Join-Path $Root $Spec.dir
    $evDir = Join-Path $kbDir 'evidence'

    $evidence = New-Object System.Collections.ArrayList
    foreach ($f in (Get-ChildItem -Path $evDir -Filter *.yaml | Sort-Object Name)) {
        $text = [System.IO.File]::ReadAllText($f.FullName)
        $rec = ConvertFrom-FlatYaml -Text $text -SingleValueKeys @('limitations')
        $rec['_file'] = "evidence/$($f.Name)"
        # Sinaliza o registro cujo campo de limitações foi salvo em flow com
        # vírgula interna: ambíguo em YAML estrito, deve ser normalizado aqui.
        $rec['_ambiguousLimitations'] = [regex]::IsMatch($text, '(?m)^limitations: \[[^\]]*,[^\]]*\]')
        [void]$evidence.Add($rec)
    }

    $sources = Read-Jsonl (Join-Path $kbDir 'sources\catalogo_fontes.jsonl')
    $golden  = Read-Jsonl (Join-Path $kbDir 'evaluation\golden_set.jsonl')

    # Quantas evidências cada fonte sustenta — o revisor precisa saber o impacto
    # de invalidar uma fonte antes de invalidá-la.
    $usage = [ordered]@{}
    foreach ($r in $evidence) {
        foreach ($sid in $r['source_ids']) {
            if (-not $usage.Contains([string]$sid)) { $usage[[string]$sid] = New-Object System.Collections.ArrayList }
            [void]$usage[[string]$sid].Add($r['id'])
        }
    }

    return [ordered]@{
        key             = $Spec.key
        id              = Split-Path -Leaf $Spec.dir
        dir             = $Spec.dir
        label           = $Spec.label
        blurb           = $Spec.blurb
        evidencePrefix  = $Spec.evidencePrefix
        axisField       = $Spec.axisField
        axisLabel       = $Spec.axisLabel
        # ReadAllText, e nao Get-Content: no PowerShell 5.1 o Get-Content le
        # pela codepage ANSI do sistema e transforma os acentos destes dois JSON
        # em mojibake ("nao" virava "nÃ£o" dentro da pagina publicada).
        manifest        = ([System.IO.File]::ReadAllText((Join-Path $kbDir 'MANIFEST.json')) | ConvertFrom-Json)
        schema          = ([System.IO.File]::ReadAllText((Join-Path $kbDir 'schemas\evidence.schema.json')) | ConvertFrom-Json)
        evidence        = $evidence
        sources         = $sources
        golden          = $golden
        sourceUsage     = $usage
        vocab           = [ordered]@{
            axis     = (Get-Vocab $evidence $Spec.axisField)
            profiles = (Get-Vocab $evidence 'profiles')
            topics   = (Get-Vocab $evidence 'topics')
            outcomes = (Get-Vocab $evidence 'outcomes')
        }
        synthesisLabel  = $Spec.synthesisLabel
        syntheses       = (Read-DirMd $kbDir $Spec.synthesisDir)
        policies        = (Read-DirMd $kbDir 'policies')
        glossary        = (Read-Md $kbDir 'glossary/glossario.md')
        retrieval       = (Read-Md $kbDir 'retrieval/chunking_e_recuperacao.md')
    }
}

$specs = @(
    [ordered]@{
        key = 'RUN'; dir = 'KB_RUN_SR'; label = 'Corrida'
        blurb = 'Fisiologia de endurance, distribuição de intensidade, prova, prevenção de lesão e nutrição de corrida.'
        evidencePrefix = 'BC'; axisField = 'distances'; axisLabel = 'Distâncias'
        synthesisDir = 'distances'; synthesisLabel = 'Distâncias'
    },
    [ordered]@{
        key = 'MUSC'; dir = 'KB_MUSC_SR'; label = 'Musculação'
        blurb = 'Treinamento resistido: força, hipertrofia, potência, saúde, função e integração com a corrida.'
        evidencePrefix = 'BM'; axisField = 'goals'; axisLabel = 'Objetivos'
        synthesisDir = 'modules'; synthesisLabel = 'Módulos'
    }
)

$kbs = New-Object System.Collections.ArrayList
foreach ($s in $specs) { [void]$kbs.Add((Import-Kb $s)) }

$payload = [ordered]@{
    generatedAt = (Get-Date -Format 'yyyy-MM-dd')
    kbs         = $kbs
}

# ------------------------------------------------------------- validação

$problems = New-Object System.Collections.ArrayList
foreach ($kb in $kbs) {
    $srcIds = @($kb.sources | ForEach-Object { $_.id })
    $evIds  = @($kb.evidence | ForEach-Object { $_['id'] })

    foreach ($r in $kb.evidence) {
        foreach ($sid in $r['source_ids']) {
            if ($srcIds -notcontains $sid) { [void]$problems.Add("$($kb.id)/$($r['id']): fonte inexistente $sid") }
        }
    }
    foreach ($g in $kb.golden) {
        foreach ($eid in $g.expected_evidence_ids) {
            if ($evIds -notcontains $eid) { [void]$problems.Add("$($kb.id)/$($g.id): evidência inexistente $eid") }
        }
    }
    if ($kb.manifest.evidence_records -ne $kb.evidence.Count) {
        [void]$problems.Add("$($kb.id): MANIFEST declara $($kb.manifest.evidence_records) evidências, encontrei $($kb.evidence.Count)")
    }
    if ($kb.manifest.source_records -ne $kb.sources.Count) {
        [void]$problems.Add("$($kb.id): MANIFEST declara $($kb.manifest.source_records) fontes, encontrei $($kb.sources.Count)")
    }
    if ($kb.manifest.golden_set_cases -ne $kb.golden.Count) {
        [void]$problems.Add("$($kb.id): MANIFEST declara $($kb.manifest.golden_set_cases) casos de golden set, encontrei $($kb.golden.Count)")
    }
}

# ---------------------------------------------------------------- output

$shell = [System.IO.File]::ReadAllText((Join-Path $Here 'shell.html'))
$css   = [System.IO.File]::ReadAllText((Join-Path $Here 'app.css'))
$js    = [System.IO.File]::ReadAllText((Join-Path $Here 'app.js'))

# `<\/` impede que qualquer "</script>" dentro do conteúdo das KBs feche a tag
# que carrega os dados.
$json = ($payload | ConvertTo-Json -Depth 30 -Compress).Replace('</', '<\/')

$html = $shell.Replace('/*__CSS__*/', $css).Replace('/*__DATA__*/', $json).Replace('/*__JS__*/', $js)

# Sem BOM: o arquivo e servido como HTML, nao lido pelo PowerShell.
[System.IO.File]::WriteAllText($Out, $html, (New-Object System.Text.UTF8Encoding($false)))

$totEv   = ($kbs | ForEach-Object { $_.evidence.Count } | Measure-Object -Sum).Sum
$totSrc  = ($kbs | ForEach-Object { $_.sources.Count } | Measure-Object -Sum).Sum
$totGold = ($kbs | ForEach-Object { $_.golden.Count } | Measure-Object -Sum).Sum
$totPend = ($kbs | ForEach-Object { @($_.sources | Where-Object { $_.license_status -eq 'needs_verification' }).Count } | Measure-Object -Sum).Sum
$totAmb  = ($kbs | ForEach-Object { @($_.evidence | Where-Object { $_['_ambiguousLimitations'] }).Count } | Measure-Object -Sum).Sum

Write-Host ("kb-review-form.html gerado ({0:N0} KB)" -f ($html.Length / 1KB))
Write-Host "  $totEv evidencias, $totSrc fontes, $totGold casos de golden set"
Write-Host "  $totPend fontes com licenca needs_verification"
Write-Host "  $totAmb registros com limitations ambiguas em flow YAML"

if ($problems.Count) {
    Write-Host ""
    Write-Host "Inconsistencias encontradas nas KBs:"
    foreach ($p in $problems) { Write-Host "  - $p" }
}
else {
    Write-Host "  nenhuma referencia quebrada entre evidencias, fontes e golden set"
}
