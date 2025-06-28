export const triggerCategories = {
  celebratory: {
    name: "Celebratory/Positive",
    questions: [
      {
        id: "cel_01",
        question: "Do you ever feel like you want to relapse when you feel successful after accomplishing something?",
        yesIndicators: [
          "want to relapse",
          "feel successful",
          "accomplishing something",
          "celebration",
          "reward myself",
          "treat myself",
          "deserve it",
          "earned it"
        ],
        noIndicators: [
          "don't want to relapse",
          "stay clean",
          "healthy celebration",
          "no urge",
          "proud without substances",
          "natural satisfaction"
        ]
      },
      {
        id: "cel_02",
        question: "Do you ever feel like you want to relapse when you feel invincible/too powerful after accomplishing something?",
        yesIndicators: [
          "feel invincible",
          "too powerful",
          "nerfing oneself",
          "bring myself down",
          "humble myself",
          "level myself",
          "ground myself"
        ],
        noIndicators: [
          "stay grounded",
          "healthy confidence",
          "balanced feelings",
          "no need to sabotage",
          "accept success"
        ]
      },
      {
        id: "cel_03",
        question: "Do you ever feel like you want to relapse to make already positive emotions even better?",
        yesIndicators: [
          "make positive emotions better",
          "enhance good feelings",
          "amplify happiness",
          "boost positive mood",
          "intensify joy",
          "make it even better"
        ],
        noIndicators: [
          "content with natural emotions",
          "don't need enhancement",
          "happy as is",
          "natural joy is enough",
          "no need to amplify"
        ]
      }
    ]
  },
  environmental: {
    name: "Environmental (Sensory Inputs)",
    questions: [
      {
        id: "env_01",
        question: "Do you feel more likely to relapse when you return to a location where you used to habitually do your addicted activity?",
        yesIndicators: [
          "return to location",
          "used to habitually",
          "addicted activity",
          "old using spot",
          "familiar place",
          "previous location",
          "habitual place"
        ],
        noIndicators: [
          "no location triggers",
          "anywhere is safe",
          "don't associate places",
          "neutral to locations",
          "no place triggers"
        ]
      },
      {
        id: "env_02",
        question: "Do you feel more likely to relapse when you see the addicted substance/media/other?",
        yesIndicators: [
          "see addicted substance",
          "see media",
          "visual triggers",
          "see the substance",
          "see the media",
          "visual cues",
          "see the object"
        ],
        noIndicators: [
          "no visual triggers",
          "doesn't affect me",
          "neutral to seeing",
          "no reaction",
          "indifferent to visuals"
        ]
      },
      {
        id: "env_03",
        question: "Do you feel more likely to relapse when you see things that remind you of your addiction, for example a lighter, bottle opener, McDonalds logo?",
        yesIndicators: [
          "remind you of addiction",
          "addiction paraphernalia",
          "lighter",
          "bottle opener",
          "McDonalds logo",
          "triggers memories",
          "reminds me of using"
        ],
        noIndicators: [
          "no reminders trigger",
          "neutral to objects",
          "don't associate",
          "no memory triggers",
          "objects don't affect me"
        ]
      },
      {
        id: "env_04",
        question: "Do you feel more likely to relapse during certain times of day?",
        yesIndicators: [
          "certain times of day",
          "position of sun",
          "time triggers",
          "specific hours",
          "time of day",
          "daily patterns",
          "time-based triggers"
        ],
        noIndicators: [
          "no time triggers",
          "any time is same",
          "no daily patterns",
          "time doesn't matter",
          "no time associations"
        ]
      }
    ]
  },
  social: {
    name: "Social",
    questions: [
      {
        id: "soc_01",
        question: "Do you feel more likely to relapse when the opportunity is given by a friend/family member?",
        yesIndicators: [
          "opportunity given",
          "friend family member",
          "offered by someone",
          "given by friend",
          "family offers",
          "social opportunity",
          "someone provides"
        ],
        noIndicators: [
          "no social pressure",
          "decline offers",
          "say no to friends",
          "family doesn't influence",
          "independent choice"
        ]
      },
      {
        id: "soc_02",
        question: "Do you ever feel like the main reason you relapse is due to peer pressure?",
        yesIndicators: [
          "main reason",
          "due to peer pressure",
          "peer pressure",
          "social pressure",
          "group influence",
          "peer influence",
          "social pressure"
        ],
        noIndicators: [
          "not peer pressure",
          "my own choice",
          "independent decision",
          "not social influence",
          "personal reasons"
        ]
      },
      {
        id: "soc_03",
        question: "Do you ever feel the need to relapse to escape from a toxic relationship?",
        yesIndicators: [
          "escape toxic relationship",
          "toxic relationship",
          "escape from relationship",
          "avoid toxic person",
          "escape toxicity",
          "run from relationship"
        ],
        noIndicators: [
          "healthy relationships",
          "no toxic people",
          "don't need escape",
          "good relationships",
          "no escape needed"
        ]
      },
      {
        id: "soc_04",
        question: "Do you ever feel the need to relapse because a relationship is dependent on your addiction?",
        yesIndicators: [
          "relationship dependent",
          "dependent on addiction",
          "relationship needs addiction",
          "addiction maintains relationship",
          "relationship requires using",
          "dependent relationship"
        ],
        noIndicators: [
          "healthy relationships",
          "not dependent on addiction",
          "relationships don't require using",
          "independent relationships",
          "no dependency"
        ]
      }
    ]
  },
  emotional: {
    name: "Emotional (GLASSAB)",
    questions: [
      {
        id: "emo_01",
        question: "Do you feel more likely to relapse when you feel guilt/shame?",
        yesIndicators: [
          "feel guilt",
          "feel shame",
          "guilty feelings",
          "shameful feelings",
          "guilt triggers",
          "shame triggers",
          "guilty shame"
        ],
        noIndicators: [
          "no guilt",
          "no shame",
          "healthy emotions",
          "process guilt healthily",
          "no guilt triggers"
        ]
      },
      {
        id: "emo_02",
        question: "Do you feel more likely to relapse when you feel lonely?",
        yesIndicators: [
          "feel lonely",
          "loneliness",
          "lonely feelings",
          "alone",
          "isolated",
          "loneliness triggers",
          "feeling alone"
        ],
        noIndicators: [
          "not lonely",
          "connected",
          "have support",
          "not alone",
          "healthy connections"
        ]
      },
      {
        id: "emo_03",
        question: "Do you feel more likely to relapse when you feel angry?",
        yesIndicators: [
          "feel angry",
          "anger",
          "angry feelings",
          "mad",
          "furious",
          "anger triggers",
          "feeling mad"
        ],
        noIndicators: [
          "not angry",
          "calm",
          "peaceful",
          "manage anger",
          "healthy anger"
        ]
      },
      {
        id: "emo_04",
        question: "Do you feel more likely to relapse when you feel sad?",
        yesIndicators: [
          "feel sad",
          "sadness",
          "sad feelings",
          "depressed",
          "down",
          "sadness triggers",
          "feeling down"
        ],
        noIndicators: [
          "not sad",
          "happy",
          "content",
          "manage sadness",
          "healthy sadness"
        ]
      },
      {
        id: "emo_05",
        question: "Do you feel more likely to relapse when you feel stressed?",
        yesIndicators: [
          "feel stressed",
          "stress",
          "stressed feelings",
          "overwhelmed",
          "pressure",
          "stress triggers",
          "feeling overwhelmed"
        ],
        noIndicators: [
          "not stressed",
          "relaxed",
          "calm",
          "manage stress",
          "healthy stress"
        ]
      },
      {
        id: "emo_06",
        question: "Do you feel more likely to relapse when you feel anxious?",
        yesIndicators: [
          "feel anxious",
          "anxiety",
          "anxious feelings",
          "worried",
          "nervous",
          "anxiety triggers",
          "feeling worried"
        ],
        noIndicators: [
          "not anxious",
          "calm",
          "relaxed",
          "manage anxiety",
          "healthy anxiety"
        ]
      }
    ]
  },
  cognitive: {
    name: "Cognitive",
    questions: [
      {
        id: "cog_01",
        question: "Do you ever feel like: 'just once won't hurt, right?'?",
        yesIndicators: [
          "just once won't hurt",
          "downplaying consequences",
          "minimizing risk",
          "just once",
          "won't hurt",
          "downplay consequences",
          "minimize risk"
        ],
        noIndicators: [
          "know it will hurt",
          "understand consequences",
          "no downplaying",
          "realistic about risk",
          "aware of consequences"
        ]
      },
      {
        id: "cog_02",
        question: "Do you ever feel like: 'Life sucks, fuck it'?",
        yesIndicators: [
          "life sucks",
          "fuck it",
          "helplessness",
          "hopeless",
          "give up",
          "what's the point",
          "helpless thinking"
        ],
        noIndicators: [
          "life is good",
          "hopeful",
          "positive outlook",
          "see possibilities",
          "optimistic"
        ]
      },
      {
        id: "cog_03",
        question: "Do you ever feel like: 'I already messed up, might as well enjoy it until I get back on track'?",
        yesIndicators: [
          "already messed up",
          "might as well enjoy",
          "black and white thinking",
          "all or nothing",
          "since I failed",
          "enjoy the failure",
          "black white thinking"
        ],
        noIndicators: [
          "learn from mistakes",
          "get back on track",
          "don't give up",
          "continue recovery",
          "no all or nothing"
        ]
      },
      {
        id: "cog_04",
        question: "Do you ever feel like: 'I can't handle it anymore, I feel defeated. I'm going to relapse'?",
        yesIndicators: [
          "can't handle it",
          "feel defeated",
          "going to relapse",
          "manifestation",
          "self-fulfilling prophecy",
          "defeated thinking",
          "give up"
        ],
        noIndicators: [
          "can handle it",
          "stay strong",
          "don't give up",
          "keep fighting",
          "resilient"
        ]
      }
    ]
  },
  physiological: {
    name: "Physiological (HALT)",
    questions: [
      {
        id: "phy_01",
        question: "Do you feel you are more prone to relapse when you are hungry?",
        yesIndicators: [
          "more prone when hungry",
          "hungry triggers",
          "hunger",
          "hungry state",
          "need food",
          "hungry relapse",
          "hunger triggers"
        ],
        noIndicators: [
          "not affected by hunger",
          "manage hunger",
          "eat regularly",
          "hunger doesn't trigger",
          "healthy eating"
        ]
      },
      {
        id: "phy_02",
        question: "Do you feel you are more prone to relapse when you are angry?",
        yesIndicators: [
          "more prone when angry",
          "angry triggers",
          "anger",
          "angry state",
          "mad",
          "angry relapse",
          "anger triggers"
        ],
        noIndicators: [
          "not affected by anger",
          "manage anger",
          "calm down",
          "anger doesn't trigger",
          "healthy anger management"
        ]
      },
      {
        id: "phy_03",
        question: "Do you feel you are more prone to relapse when you are lonely?",
        yesIndicators: [
          "more prone when lonely",
          "lonely triggers",
          "loneliness",
          "lonely state",
          "alone",
          "lonely relapse",
          "loneliness triggers"
        ],
        noIndicators: [
          "not affected by loneliness",
          "manage loneliness",
          "connect with others",
          "loneliness doesn't trigger",
          "healthy connections"
        ]
      },
      {
        id: "phy_04",
        question: "Do you feel you are more prone to relapse when you are physically tired?",
        yesIndicators: [
          "more prone when physically tired",
          "physically tired triggers",
          "physical exhaustion",
          "tired body",
          "physically exhausted",
          "physical tired relapse",
          "body tired triggers"
        ],
        noIndicators: [
          "not affected by physical tiredness",
          "manage physical tiredness",
          "rest properly",
          "physical tiredness doesn't trigger",
          "healthy rest"
        ]
      },
      {
        id: "phy_05",
        question: "Do you feel you are more prone to relapse when you are mentally tired?",
        yesIndicators: [
          "more prone when mentally tired",
          "mentally tired triggers",
          "mental exhaustion",
          "tired mind",
          "mentally exhausted",
          "mental tired relapse",
          "mind tired triggers"
        ],
        noIndicators: [
          "not affected by mental tiredness",
          "manage mental tiredness",
          "mental rest",
          "mental tiredness doesn't trigger",
          "healthy mental rest"
        ]
      }
    ]
  }
}; 