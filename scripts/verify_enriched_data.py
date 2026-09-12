import json
import sys

def verify():
    with open('src/data/matchups.json', 'r', encoding='utf-8') as f:
        matchups = json.load(f)

    with open('src/data/matchup-summaries.json', 'r', encoding='utf-8') as f:
        summaries = json.load(f)

    print(f"Checking {len(matchups)} matchups and {len(summaries)} summaries...")

    assert len(matchups) == 170, f"Expected 170 matchups, got {len(matchups)}"
    assert len(summaries) == 170, f"Expected 170 summaries, got {len(summaries)}"

    valid_starts = {'Q', 'W', 'E', 'E_ALCOVE', 'SITUATIONAL'}
    start_counts = {k: 0 for k in valid_starts}

    for m in matchups:
        name = m['championName']
        l1 = m.get('level1Start')
        assert l1 in valid_starts, f"{name}: Invalid level1Start '{l1}'"
        start_counts[l1] += 1

        win_pt = m.get('winConditionPt', '')
        caut_pt = m.get('cautionPt', '')
        l1_exp_pt = m.get('level1ExplanationPt', '')

        assert len(win_pt) > 20, f"{name}: winConditionPt too short ({len(win_pt)} chars)"
        assert len(caut_pt) > 20, f"{name}: cautionPt too short ({len(caut_pt)} chars)"
        assert len(l1_exp_pt) > 10, f"{name}: level1ExplanationPt too short ({len(l1_exp_pt)} chars)"

    print("All 170 matchups verified successfully!")
    print("Level 1 Starts Distribution:")
    for k, v in start_counts.items():
        print(f"  {k}: {v} champions")

    # Specific tests
    teemo = next(m for m in matchups if m['championName'] == 'Teemo')
    assert teemo['level1Start'] == 'E', f"Teemo should be E start, got {teemo['level1Start']}"
    assert 'cegar' in teemo['winConditionPt'].lower() or 'blind' in teemo['winConditionPt'].lower(), "Teemo winCondition must mention blind"
    assert 'cogumelo' in teemo['cautionPt'].lower() or 'oráculo' in teemo['cautionPt'].lower() or 'trinket' in teemo['cautionPt'].lower(), "Teemo caution must mention shrooms/trinket"
    print("Teemo validation: 100% PASSED!")

    riven = next(m for m in matchups if m['championName'] == 'Riven')
    assert riven['level1Start'] == 'W', f"Riven should be W start, got {riven['level1Start']}"
    print("Riven validation: 100% PASSED!")

    quinn = next(m for m in matchups if m['championName'] == 'Quinn')
    assert quinn['level1Start'] == 'E_ALCOVE', f"Quinn should be E_ALCOVE start, got {quinn['level1Start']}"
    print("Quinn validation: 100% PASSED!")

    darius = next(m for m in matchups if m['championName'] == 'Darius')
    assert darius['level1Start'] == 'SITUATIONAL', f"Darius should be SITUATIONAL start, got {darius['level1Start']}"
    print("Darius validation: 100% PASSED!")

    print("\nALL SYSTEM VERIFICATIONS PASSED!")

if __name__ == '__main__':
    verify()
