import { createDiv, createSpan } from "../dom_util"

// When used, the AttackResult component should be included somewhere on the page.

// Rolls an n-sided dice a certain number of times. If a dice roll is
// less than the minRoll, will reroll until it is >= minRoll.
export function RollDice(sides: number, numRolls: number, minRoll?: number): DiceRoll[] {
    const rollFunc = (sides: number): number => Math.floor(Math.random() * sides) + 1;
    let rolls: DiceRoll[] = [];
    for (let i = 0; i < numRolls; i++) {
        let diceRoll = rollFunc(sides);
        if (minRoll !== undefined) {
            while (diceRoll < minRoll) {
                diceRoll = rollFunc(sides);
            }
        }
        rolls.push({ result: diceRoll, sides: sides });
    }
    return rolls;
}

// Roll modifiers for d20 rolls.
export enum D20Modifier {
    NONE = 1,
    ADVANTAGE = 2,
    DISADVANTAGE = 3
}

// A single roll of a dice.
export interface DiceRoll {
    result: number;
    sides: number;
}

// A dice modifier, e.g.:
//   {
//      label: "Strength Mod",
//      value: 3,
//      source: "Strength modifier for character."
//   }
export interface Modifier {
    label: string;
    value: number;
    source: string;
}

function generateModifiersElement(modifiers: Modifier[]): HTMLDivElement {
    return createDiv(null, 'modifiers-container', [
        ...modifiers.map(modifier => createDiv(null, 'modifier-row', [
            createSpan(modifier.label),
            createDiv(null, 'modifier-result-container', [
                createDiv(String(modifier.value), 'dice-roll'),
            ])
        ]))
    ]);
}

interface HitResult {
    diceRolls: DiceRoll[],
    result: number,
    winningRoll: DiceRoll
}

export class Hit {
    modifiers: Modifier[];
    hit: HitResult;

    constructor(modifiers: Modifier[], d20Modifier: D20Modifier) {
        this.modifiers = modifiers;
        this.hit = this.RollHitDice(d20Modifier);
    }

    // Roll hit dice using the provided information.
    RollHitDice(d20Modifier: D20Modifier): HitResult {
        const hitRolls: DiceRoll[] = RollDice(20, d20Modifier !== D20Modifier.NONE ? 2 : 1);
        let winningRoll: DiceRoll = hitRolls[0];
        if (d20Modifier != D20Modifier.NONE) {
            for (const roll of hitRolls) {
                if (
                    (d20Modifier == D20Modifier.ADVANTAGE && roll.result > winningRoll.result) || 
                    (d20Modifier == D20Modifier.DISADVANTAGE && roll.result < winningRoll.result)
                ) {
                    winningRoll = roll;
                }
            }
        }

        let winningResult = winningRoll.result;
        if (winningResult != 20 && winningResult != 1) {
            winningResult = winningRoll.result + this.modifiers.reduce((sum, modifier) => { return sum + modifier.value; }, 0);
        }

        return {
            diceRolls: hitRolls,
            result: winningResult,
            winningRoll: winningRoll
        };
    }

    isCrit(): boolean {
        return this.hit.winningRoll.result == 20;
    }

    isFail(): boolean {
        return this.hit.winningRoll.result == 1;
    }

    generateHitElement(): HTMLDivElement {
        return createDiv(null, 'dice-roll-container', [
            createDiv(null, 'dice-roll-row result-summary', [
                createSpan('To Hit', 'hit-label'),
                createDiv(null, 'dice-result-container', [
                    ...this.hit.diceRolls.map(diceRoll => createDiv(String(diceRoll.result), 'dice-roll', [
                        createSpan(String(diceRoll.sides), 'dice-roll-sides')
                    ])),
                    createDiv(
                        String(this.hit.result),
                        `dice-final-result dice-roll ${this.isCrit() ? 'dice-crit' : this.isFail() ? 'dice-fail' : ''}`
                    )]),
            ]),
            ...(this.modifiers.length > 0 ? [generateModifiersElement(this.modifiers)] : [])
        ]);
    }
}

// Damage from a single source, e.g. Weapon or Crimson Rite 
export class Damage {
    label: string;
    diceRolls: DiceRoll[];
    modifiers: Modifier[];
    isCritical: boolean;

    constructor(label: string, diceRolls: DiceRoll[], modifiers: Modifier[], isCritical: boolean) {
        this.label = label;
        this.diceRolls = diceRolls;
        this.modifiers = modifiers;
        this.isCritical = isCritical;
    }

    damageTotal(): number {
        let total = 0;
        for (const modifier of this.modifiers) {
            total += modifier.value;
        }
        for (const roll of this.diceRolls) {
            total += (this.isCritical ? roll.result * 2 : roll.result);
        }
        return total;
    }

    generateDamageElement(): HTMLDivElement {
        return createDiv(null, 'dice-roll-container', [
            createDiv(null, 'dice-roll-row result-summary', [
                createSpan(this.label, 'damage-label'),
                createDiv(null, 'dice-result-container', [
                    ...this.diceRolls.map(diceRoll => createDiv(String(diceRoll.result), 'dice-roll', [
                        createSpan(String(diceRoll.sides), 'dice-roll-sides')
                    ])),
                    createDiv(String(this.damageTotal()), 'dice-final-result dice-roll')
                ])
            ]),
            ...(this.modifiers.length > 0 ? [generateModifiersElement(this.modifiers)] : [])
        ]);
    }
}

export function CreateAttack(attackDetails: {
    numAttacks: number,
    hitDetails: {
        modifiers: Modifier[],
        d20Modifier: D20Modifier
    }, damageDetails: {
        label: string,
        diceRolls: {
            sides: number,
            numRolls: number,
            minRoll?: number
        },
        modifiers: Modifier[],
    }[]
}) {
    const rollsContainer: HTMLElement = document.getElementById('rolls-container')!;
    rollsContainer.innerHTML = '';

    for (let i = 0; i < attackDetails.numAttacks; i++) {
        // Roll hit dice.
        const hit: Hit = new Hit(attackDetails.hitDetails.modifiers, attackDetails.hitDetails.d20Modifier);

        // Create damages.
        const damages: Damage[] = [
            ...attackDetails.damageDetails.map(damageDetail => new Damage(
                damageDetail.label, RollDice(
                    damageDetail.diceRolls.sides,
                    damageDetail.diceRolls.numRolls,
                    damageDetail.diceRolls.minRoll
                ), damageDetail.modifiers, hit.isCrit())
            )
        ];
        const totalDmg = damages.reduce((sum, damage) => {
            return sum + damage.damageTotal();
        }, 0);

        rollsContainer.appendChild(createDiv(null, 'attack-result', [
            hit.generateHitElement(),
            ...damages.map(damage => damage.generateDamageElement()),
            createDiv(`Total Damage: ${totalDmg}`, 'attack-total')
        ]));
    }
}


