import { RollDice, CreateAttack, Damage } from "../dice_roller/dice_roller";

function InitiateRoll(times: number, advantage: boolean) {
    // const poofers = game.data.actors.find(c => c.name === "Poofers").data;
    const strMod = 4; // poofers.abilities.str.mod; -- wouldn't update
    const prof = 4; // poofers.attributes.prof; -- wouldn't update

    const hitBonus = 1;
    const damageBonus = 1;
    const rageDamage = 2;

    function RollHits(numHits: number, advantage: boolean) {
        let content = '';
        for (let i = 0; i < numHits; i++) {
            var damageRoll = RollDice(6, 3, 2);

            var hitDice =
                advantage ? Math.max(RollDice(20, 1, 1).total, RollDice(20, 1, 1).total) : RollDice(20, 1, 1).total;
            var hitDiceRolled = hitDice + strMod + prof + hitBonus;

            const crimsomeRiteRoll = RollDice(4, 1, 1);
            const fireRuneRoll = RollDice(6, 1, 1);

            const totalDiceDamage = damageRoll.total + crimsomeRiteRoll.total + fireRuneRoll.total;
            const totalDamage = totalDiceDamage + strMod + damageBonus + rageDamage;
            const crit = hitDiceRolled == 20;

            const advantageStr = advantage ? ' (advantage)' : '';

            content +=
                `${i > 0 ? '<br>----------------------<br><br>' : ''}
          <b>Hit ${i + 1}</b><br>
          <div class="beyond20-roll-cell"><span class="${crit ? 'beyond20-roll-detail-crit' :
                    hitDiceRolled == 1 ? 'beyond20-roll-detail-fail' :
                        'beyond20-roll-detail-normal'
                }">${hitDiceRolled}</span>
          </div> Rolled hit${advantageStr}: ${hitDice}<br><br>
          <div> 
            <b>Slashing damage: </b> ${damageRoll.total}
            <span style="display: inline-block; float:right;">[${damageRoll.rolls.join(', ')}]</span><br>
            <b>Fire (crimson rite) damage: </b> ${crimsomeRiteRoll.total}
            <span style="display: inline-block; float:right;">[${crimsomeRiteRoll.rolls.join(', ')}]</span><br>
            <b>Fire (rune) damage: </b> ${fireRuneRoll.total}
            <span style="display: inline-block; float:right;">[${fireRuneRoll.rolls.join(', ')}]</span><br>
            Strength: ${strMod}<br>Magic Weapon Bonus: ${damageBonus}<br>Rage: ${rageDamage}<br>
            <b>Total damage: </b> ${crit ? totalDamage + totalDiceDamage : totalDamage}<br> </div>`;

            console.log(content);

            CreateAttack(
                [
                    new Damage('Weapon', damageRoll.rolls, damageRoll.sides, [
                        { label: "Strength mod", value: strMod, source: "Strength modifier (barbarian)" },
                        { label: "Rage", value: rageDamage, source: "Extra damage when raging (barbarian)" },
                        { label: "Weapon bonus", value: damageBonus, source: "Extra damage from magic weapon (weapon)" },
                    ]),
                    new Damage('Crimson Rite', crimsomeRiteRoll.rolls, crimsomeRiteRoll.sides, []),
                    new Damage('Fire Rune', fireRuneRoll.rolls, fireRuneRoll.sides, []),
                ]);
        }
    }

    RollHits(times, advantage);
}


export function initializePoofers() {
    console.log('hi');
    document.querySelector<HTMLElement>('.content')!.innerText = "Test";

    let times = document.querySelector<HTMLInputElement>('#inputs input.times')!;
    let advantage = document.querySelector<HTMLInputElement>('#inputs input.adv')!;
    let roll = document.querySelector<HTMLButtonElement>('#inputs button.roll')!;

    window.addEventListener('load', function () {
        roll.addEventListener('click', () => {
            InitiateRoll(Number(times.value), advantage.checked);
        });

        InitiateRoll(2, true);
    })
}

