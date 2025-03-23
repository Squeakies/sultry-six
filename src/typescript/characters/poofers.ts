import { RollDice, CreateAttack, Damage, Hit, D20Modifier } from "../dice_roller/dice_roller";

function InitiateRoll(times: number, advantage: boolean) {
    // const poofers = game.data.actors.find(c => c.name === "Poofers").data;
    const strMod = 4; // poofers.abilities.str.mod; -- wouldn't update
    const prof = 4; // poofers.attributes.prof; -- wouldn't update

    const hitBonus = 1;
    const damageBonus = 1;
    const rageDamage = 2;

    function RollHits(numHits: number, advantage: boolean) {

        CreateAttack({
            numAttacks: numHits,
            hitDetails: {
                modifiers:
                    [
                        { label: "Strength mod", value: strMod, source: "Strength modifier (barbarian)" },
                        { label: "Proficiency", value: prof, source: "Proficiency with two handed weapons" },
                        { label: "Weapon hit bonus", value: hitBonus, source: "Extra hit from magic weapon (weapon)" },
                    ],
                d20Modifier: advantage ? D20Modifier.ADVANTAGE : D20Modifier.NONE
            },
            damageDetails: [
                {
                    label: 'Weapon',
                    diceRolls: { sides: 6, numRolls: 2, minRoll: 3 },
                    modifiers: [
                        { label: "Strength mod", value: strMod, source: "Strength modifier (barbarian)" },
                        { label: "Rage", value: rageDamage, source: "Extra damage when raging (barbarian)" },
                        { label: "Weapon bonus", value: damageBonus, source: "Extra damage from magic weapon (weapon)" },
                    ]
                },
                {
                    label: 'Crimson Rite',
                    diceRolls: { sides: 4, numRolls: 1 },
                    modifiers: []
                },
                {
                    label: 'Fire Rune',
                    diceRolls: { sides: 6, numRolls: 1 },
                    modifiers: []
                }
            ]
        });

    }

    RollHits(times, advantage);
}


export function initializePoofers() {
    console.log('hi');
    document.querySelector<HTMLElement>('.content')!.innerText = "Test";

    let times = document.querySelector<HTMLInputElement>('#inputs input.times')!;
    let advantage = document.querySelector<HTMLInputElement>('#inputs input.adv')!;
    let roll = document.querySelector<HTMLButtonElement>('#inputs button.roll')!;
    console.log(roll);

    window.addEventListener('load', function () {
        roll.addEventListener('click', () => {
            InitiateRoll(Number(times.value), advantage.checked);
        });
    })
}

