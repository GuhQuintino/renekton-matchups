#!/usr/bin/env python3
"""
Test Suite: Strategic Summaries Integrity & Completeness Audit (170 Matchups)
Verifies that no matchup has truncated sentences, dangling ellipses ('...'), or missing final punctuation.
"""

import json
import os
import sys

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MATCHUPS_FILE = os.path.join(BASE_DIR, 'src', 'data', 'matchups.json')
SUMMARIES_FILE = os.path.join(BASE_DIR, 'src', 'data', 'matchup-summaries.json')

def test_summaries_integrity():
    print("==================================================")
    print(" AUDITORIA DE INTEGRIDADE DOS RESUMOS ESTRATÉGICOS")
    print("==================================================")

    assert os.path.exists(MATCHUPS_FILE), f"Arquivo não encontrado: {MATCHUPS_FILE}"
    assert os.path.exists(SUMMARIES_FILE), f"Arquivo não encontrado: {SUMMARIES_FILE}"

    with open(MATCHUPS_FILE, 'r', encoding='utf-8') as f:
        matchups = json.load(f)

    with open(SUMMARIES_FILE, 'r', encoding='utf-8') as f:
        summaries = json.load(f)

    assert len(matchups) == 170, f"Esperado 170 matchups, encontrado {len(matchups)}"
    assert len(summaries) == 170, f"Esperado 170 summaries, encontrado {len(summaries)}"

    errors = []
    warnings = []

    valid_endings = ('.', '!', '?', '"', "'", ')')

    for m in matchups:
        mid = m.get('id')
        name = m.get('championName', 'Desconhecido')
        s_pt = m.get('summaryPt', '').strip()
        s_en = m.get('summaryEn', '').strip()

        # 1. Checar campo não-vazio
        if not s_pt:
            errors.append(f"[{mid:03d}] {name}: summaryPt está VAZIO!")
        if not s_en:
            errors.append(f"[{mid:03d}] {name}: summaryEn está VAZIO!")

        # 2. Checar reticências ou cortes abruptos
        if s_pt.endswith('...'):
            errors.append(f"[{mid:03d}] {name}: summaryPt termina com reticências '...' (incompleto!)")
        if s_en.endswith('...'):
            errors.append(f"[{mid:03d}] {name}: summaryEn termina com reticências '...' (incompleto!)")

        # 3. Checar pontuação final válida
        if not s_pt.endswith(valid_endings):
            errors.append(f"[{mid:03d}] {name}: summaryPt não termina com pontuação válida ({s_pt[-20:]})")
        if not s_en.endswith(valid_endings):
            errors.append(f"[{mid:03d}] {name}: summaryEn não termina com pontuação válida ({s_en[-20:]})")

        # 4. Checar tamanho mínimo substancial
        if len(s_pt) < 120 and name != "Yuumi":
            warnings.append(f"[{mid:03d}] {name}: summaryPt curto ({len(s_pt)} caracteres)")

    print(f"Total de Matchups Auditadas: {len(matchups)}")
    print(f"Total de Erros Encontrados: {len(errors)}")
    print(f"Total de Avisos: {len(warnings)}")

    if errors:
        print("\n❌ FALHAS ENCONTRADAS:")
        for err in errors:
            print("  -", err)
        sys.exit(1)
    else:
        print("\n✅ TODAS AS 170 MATCHUPS PASSARAM COM SUCESSO ZERO ERROS!")

if __name__ == '__main__':
    test_summaries_integrity()
