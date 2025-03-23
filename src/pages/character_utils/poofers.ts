

function createSpan(text: string, spanClass?: string) {
  const span: HTMLSpanElement = document.createElement('span');
  span.innerText = text;
  if (spanClass) {
    span.className = spanClass;
  }
  return span;
}

function createDiv(text: string | null, divClass?: string) {
  const div: HTMLDivElement = document.createElement('div');
  if (text) {
    div.innerText = text;
  }
  if (divClass) {
    div.className = divClass;
  }
  return div;
}

interface Modifier {
  label: string;
  value: number;
  source: string;
}

class Damage {
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

function CreateAttack(damages: Damage[]) {
  const attackResultDiv = createDiv(null, 'attack-result');
  let totalDamage = 0;
  for (const damage of damages) {
    attackResultDiv.appendChild(damage.generateDamageElement());
    totalDamage += damage.getTotal();
  }
  attackResultDiv.appendChild(createDiv(`Total Damage: ${totalDamage}`, 'attack-total'));
  document.getElementById('rolls-container')!.appendChild(attackResultDiv);
}

function InitiateRoll(times: number, advantage: boolean) {
  // const poofers = game.data.actors.find(c => c.name === "Poofers").data;
  const strMod = 4; // poofers.abilities.str.mod; -- wouldn't update
  const prof = 4; // poofers.attributes.prof; -- wouldn't update

  const hitBonus = 1;
  const damageBonus = 1;
  const rageDamage = 2;

  // const damageRollScript = "{2d6r<3, 2d6r<3, 2d6r<3}kh2";

  // Rolls an n-sided dice a certain number of times. If a dice roll is
  // less than the minRoll, will reroll until it is >= minRoll.
  function RollDice(sides: number, minRoll: number, numRolls: number) {
    let rolls = [];
    let rollTotal = 0;
    for (let i = 0; i < numRolls; i++) {
      let rollFunc = (sides) => Math.floor(Math.random() * sides) + 1;
      let diceRoll = rollFunc(sides);
      while (diceRoll < minRoll) {
        diceRoll = rollFunc(sides);
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

      document.getElementById('results')!.innerHTML = content;
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

