import {createDiv, createSpan} from "../dom_util"

// When used, the AttackResult component should be included somewhere on the page.

// Rolls an n-sided dice a certain number of times. If a dice roll is
// less than the minRoll, will reroll until it is >= minRoll.
export function RollDice(sides: number, numRolls: number, minRoll?: number) {
    let rolls = [];
    let rollTotal = 0;
    for (let i = 0; i < numRolls; i++) {
        let rollFunc = (sides: number) => Math.floor(Math.random() * sides) + 1;
        let diceRoll = rollFunc(sides);
        if (minRoll) {
            while (diceRoll < minRoll) {
                diceRoll = rollFunc(sides);
            }
        }
        rolls.push(diceRoll);
        rollTotal += diceRoll;
    }
    return {
        total: rollTotal,
        rolls: rolls,
        sides: sides
    };
}

// Modifier information for a set of damage.
export interface Modifier {
    label: string;
    value: number;
    source: string;
}

export class Damage {
    label: string;
    diceRolls: number[];
    diceSides: number;
    modifiers: Modifier[];

    constructor(label: string, diceRolls: number[], diceSides: number, modifiers: Modifier[]) {
        this.label = label;
        this.diceRolls = diceRolls;
        this.diceSides = diceSides;
        this.modifiers = modifiers;
    }

    getTotal(): number {
        let total = 0;
        for (const modifier of this.modifiers) {
            total += modifier.value;
        }
        for (const roll of this.diceRolls) {
            total += roll;
        }
        return total;
    }

    createDiceRollDiv(roll: number, additionalClasses?: string) {
        const rollDiv = createDiv(String(roll), `dice-result${additionalClasses ? ' ' + additionalClasses : ''}`);
        rollDiv.appendChild(createSpan(String(this.diceSides), 'dice-roll-sides'));
        return rollDiv;
    }

    generateDamageElement(): HTMLDivElement {
        const damageContainerDiv: HTMLDivElement = createDiv(null, 'damage-container');

        const resultRowDiv: HTMLDivElement = createDiv(null, 'result-row result-summary');
        {
            const labelSpan: HTMLSpanElement = createSpan(this.label, 'damage-label');
            resultRowDiv.appendChild(labelSpan);

            const damageResultDiv: HTMLDivElement = createDiv(null, 'damage-result');
            for (const diceRoll of this.diceRolls) {
                const rollSpan: HTMLSpanElement = this.createDiceRollDiv(diceRoll);
                damageResultDiv.appendChild(rollSpan);
            }
            const totalSpan: HTMLSpanElement = createDiv(String(this.getTotal()), 'damage-total dice-result');
            damageResultDiv.appendChild(totalSpan);

            resultRowDiv.appendChild(damageResultDiv);
        }
        damageContainerDiv.appendChild(resultRowDiv);

        if (this.modifiers.length > 0) {
            const resultDetailsContainerDiv: HTMLDivElement = document.createElement('div');
            resultDetailsContainerDiv.setAttribute('class', 'result-details-container');
            {
                for (const modifier of this.modifiers) {
                    const resultDetailDiv: HTMLDivElement = createDiv(null, 'result-row');
                    resultDetailDiv.appendChild(createSpan(modifier.label));

                    const damageResultDiv = createDiv(null, 'damage-result')
                    damageResultDiv.appendChild(createDiv(String(modifier.value), 'damage-total dice-result'));
                    resultDetailDiv.appendChild(damageResultDiv);

                    resultDetailsContainerDiv.appendChild(resultDetailDiv);
                }
            }
            damageContainerDiv.appendChild(resultDetailsContainerDiv);
        }

        return damageContainerDiv;
    }
}

export function CreateAttack(damages: Damage[]) {
    const attackResultDiv = createDiv(null, 'attack-result');
    let totalDamage = 0;
    for (const damage of damages) {
        attackResultDiv.appendChild(damage.generateDamageElement());
        totalDamage += damage.getTotal();
    }
    attackResultDiv.appendChild(createDiv(`Total Damage: ${totalDamage}`, 'attack-total'));
    document.getElementById('rolls-container')!.appendChild(attackResultDiv);
}


