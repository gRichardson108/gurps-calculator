import { DiceRoll } from './dice-roll.model';
import { Status, StatusIncrement } from './status.model';

export interface Identity {
  name: string;
  title: string;
  religion: string;
}

export interface MetaIdentity {
  player: string;
  campaign: string;
  createdOn: Date;
}

export interface Attributes {
    basicMove: number;
    basicSpeed: number;
    strength: Strength;
    intelligence: number;
    dexterity: number;
    health: number;
    will: number;
    perception: Perception;
    frightCheck: number;
}

export interface Perception {
    value: number;
    hearing: number;
    tasteSmell: number;
    touch: number;
    vision: number;
}

export interface Strength {
    value: number;
    swing: string;
    thrust: string;
}

interface Meta {
  name: string;
  pointsSpent: number;
  referencePage: string;
}

export interface Trait extends Meta {
  modifierDescription: string;
}

export interface Skill extends Meta {
  level: number;
  relativeLevel: string;
  note: string;
}

export interface Encumbrance {
  dodge: number;
  level: string;
  maxLoad: string;
  move: number;
  isCurrentLevel: boolean;
}

export class Character {
  identity: Identity;
  status: Status;
  attributes: Attributes;
  traits: Trait[];
  skills: Skill[];
  encumbranceLevels: Encumbrance[];

  private characterJson: any;
  constructor(characterJson: any) {
    this.characterJson = characterJson;
    this.LoadCharacter();
  }

  LoadCharacter() {
    this.loadSkills();
    this.loadTraits();
    this.loadIdentity();
    this.loadStatus();
    this.loadAttributes();
    this.loadEncumbrance();
  }

  private loadSkills() {
    this.skills = this.characterJson.Skills.map(s => {
      const skill: Skill = {
        name: s.DescriptionPrimary,
        level: s.SkillLevel,
        relativeLevel: s.RelativeSkillLevel,
        pointsSpent: s.Points,
        referencePage: s.Ref,
        note: s.DescriptionNotes
      };
      return skill;
    });
  }

  private loadTraits() {
    this.traits = this.characterJson.AdvantagesAndDisadvantages.sort(
      (a, b) => b.Points - a.Points
    ).map(t => {
      const trait: Trait = {
        name: t.DescriptionPrimary,
        pointsSpent: t.Points,
        referencePage: t.Ref,
        modifierDescription: t.DescriptionModifierNotes
      };

      return trait;
    });
  }

  private loadIdentity() {
    this.identity = <Identity>{
      name: this.characterJson.Identity.Name,
      title: this.characterJson.Identity.Title,
      religion: this.characterJson.Identity.Religion
    };
  }

  private loadStatus() {
    const fpStatusInc = new StatusIncrement(
      this.characterJson.FpAndHp.FP,
      this.characterJson.FpAndHp.CurrentFp,
      StatusIncrement.getFpStatusLevels(this.characterJson.FpAndHp.FP)
    );
    const hpStatusInc = new StatusIncrement(
      this.characterJson.FpAndHp.HP,
      this.characterJson.FpAndHp.CurrentHp,
      StatusIncrement.getHpStatusLevels(this.characterJson.FpAndHp.HP)
    );
    this.status = new Status(hpStatusInc, fpStatusInc);
  }

  private loadAttributes() {
      const c = this.characterJson.Attributes;
      this.attributes = <Attributes> {
          basicMove: c.BasicMove,
          basicSpeed: c.BasicSpeed,
          dexterity: c.Dexterity,
          frightCheck: c.FrightCheck,
          health: c.Health,
          intelligence: c.Intelligence,
          will: c.Will,
          strength: <Strength> {
              value: c.Strength,
              swing: c.Swing,
              thrust: c.Thrust
          },
          perception: <Perception> {
              value: c.Perception,
              hearing: c.Hearing,
              touch: c.Touch,
              tasteSmell: c.TasteAndSmell,
              vision: c.Vision
          }
      };
  }

  private loadEncumbrance() {
    const c = this.characterJson.EncumberanceMoveAndDodges;
    this.encumbranceLevels = c.map(e => {
      return <Encumbrance> {
        dodge: +e.Dodge,
        level: e.Level,
        maxLoad: e.MaxLoad,
        move: +e.Move,
        isCurrentLevel: e.isActive
      };
    });
  }
}
