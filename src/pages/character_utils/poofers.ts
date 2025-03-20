interface Modifier {
  label: string;
  value: number;
  source: string;
}

class Damage{
  label: string;
  diceRolls: number[];
  modifiers: Modifier[];

  constructor(label: string, diceRolls: number[], modifiers: Modifier[]) {
    this.label = label;
    this.diceRolls = diceRolls;
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

  generateDamageElement(): HTMLDivElement {
    const damageDiv: HTMLDivElement = document.createElement('div');
    damageDiv.setAttribute('class', 'damage');
    
    const labelSpan: HTMLSpanElement = document.createElement('span');
    labelSpan.innerText = `${this.label}:`;
    damageDiv.appendChild(labelSpan);

    const damageResultDiv: HTMLDivElement = document.createElement('div');
    damageResultDiv.className = 'damage-result';
    for (const diceRoll of this.diceRolls) {
      const rollSpan: HTMLSpanElement = document.createElement('span');
      rollSpan.innerText = String(diceRoll);
      rollSpan.className = 'dice-result';
      damageResultDiv.appendChild(rollSpan);
    }
    const totalSpan: HTMLSpanElement = document.createElement('span');
    totalSpan.innerText = String(this.getTotal());
    totalSpan.className = 'damage-total';
    damageResultDiv.appendChild(totalSpan);

    damageDiv.appendChild(damageResultDiv);

    return damageDiv;
  }
}

function CreateRollResult(results: Damage[]) {
  const rollContainer: HTMLDivElement = document.createElement('div');
  rollContainer.setAttribute('class', 'roll-result');

  for (const damage of results) {
    rollContainer.appendChild(damage.generateDamageElement());
  }

  document.getElementById('rolls-container')!.appendChild(rollContainer);
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
        rolls: rolls
      };
    }
  
    function RollHits(numHits: number, advantage: boolean) {
      let damageRolls = [];
      for (let i = 0; i < numHits + 1; i++) {
        damageRolls.push(RollDice(6, 3, 2));
      }
      // Sort highest to lowest.
      damageRolls = damageRolls.sort((a, b) => b - a);
      console.log(damageRolls.join(','));
  
  
  
      let content = '';
      for (let i = 0; i < damageRolls.length && i < numHits; i++) {
        var hitDice = 
          advantage ? Math.max(RollDice(20, 1, 1).total, RollDice(20, 1, 1).total) : RollDice(20, 1, 1).total;
        var hitDiceRolled = hitDice + strMod + prof + hitBonus;
  
        const crimsomeRiteRoll = RollDice(4, 1, 1);
        const fireRuneRoll = RollDice(6, 1, 1);
  
        const totalDiceDamage = damageRolls[i].total + crimsomeRiteRoll.total + fireRuneRoll.total;
        const totalDamage = totalDiceDamage + strMod + damageBonus + rageDamage;
        const crit = hitDiceRolled == 20;
  
        const advantageStr = advantage ? ' (advantage)' : '';
  
        content +=
          `${i > 0 ? '<br>----------------------<br><br>' : ''}
        <b>Hit ${i + 1}</b><br>
        <div class="beyond20-roll-cell"><span class="${
                crit ? 'beyond20-roll-detail-crit' : 
                hitDiceRolled == 1 ? 'beyond20-roll-detail-fail' : 
                'beyond20-roll-detail-normal'
          }">${hitDiceRolled}</span>
        </div> Rolled hit${advantageStr}: ${hitDice}<br><br>
        <div> 
          <b>Slashing damage: </b> ${damageRolls[i].total}
          <span style="display: inline-block; float:right;">[${damageRolls[i].rolls.join(', ')}]</span><br>
          <b>Fire (crimson rite) damage: </b> ${crimsomeRiteRoll.total}
          <span style="display: inline-block; float:right;">[${crimsomeRiteRoll.rolls.join(', ')}]</span><br>
          <b>Fire (rune) damage: </b> ${fireRuneRoll.total}
          <span style="display: inline-block; float:right;">[${fireRuneRoll.rolls.join(', ')}]</span><br>
          Strength: ${strMod}<br>Magic Weapon Bonus: ${damageBonus}<br>Rage: ${rageDamage}<br>
          <b>Total damage: </b> ${crit ? totalDamage + totalDiceDamage : totalDamage}<br> </div>`;
  
        console.log(content);
  
        document.getElementById('results')!.innerHTML = content;
        CreateRollResult([new Damage('Weapon', damageRolls[i].rolls, [
          {label: "Strength mod", value: strMod, source: "Strength modifier (barbarian)"},
          {label: "Rage", value: rageDamage, source: "Extra damage when raging (barbarian)"},
          {label: "Weapon bonus", value: damageBonus, source: "Extra damage from magic weapon (weapon)"},
        ])]);
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

    window.addEventListener('load', function() {
    roll.addEventListener('click', () => {
        InitiateRoll(Number(times.value), advantage.checked);
    });

    InitiateRoll(2, true);
})
}

