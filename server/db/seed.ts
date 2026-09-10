import Database from 'better-sqlite3';

export function seedDatabase(db: Database.Database) {
  const existingTopics = db.prepare('SELECT count(*) as count FROM topics').get() as { count: number };
  if (existingTopics.count > 0) {
    return; // Already seeded
  }

  const insertUser = db.prepare(`
    INSERT INTO users (
      id, email, handle, chaos_index, is_verified, avatar_seed, age, gender, intent, city,
      latitude, longitude, geo_broadcasting, ghost_mode, global_radius,
      role, tagline, real_name, real_photo, is_guest
    ) VALUES (
      ?, ?, ?, ?, ?, ?, ?, ?, ?, ?,
      ?, ?, ?, ?, ?,
      ?, ?, ?, ?, ?
    )
  `);

  const insertTopic = db.prepare(`
    INSERT INTO topics (id, title, category, description, debater_count, heat_score, match_rate, is_hot, creator_id)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const insertUserTopic = db.prepare(`
    INSERT INTO user_topics (user_id, topic_id) VALUES (?, ?)
  `);

  const insertResonanceTag = db.prepare(`
    INSERT INTO user_resonance_tags (id, user_id, tag) VALUES (?, ?, ?)
  `);

  const insertRumor = db.prepare(`
    INSERT INTO rumors (id, topic_id, author_id, content, encrypted_content, is_encrypted, match_rate, agrees, debates, tags)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const insertRoom = db.prepare(`
    INSERT INTO rooms (id, title, category, host_id, is_live, is_private, active_speakers, listeners, recent_debate)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const insertRoomMessage = db.prepare(`
    INSERT INTO room_messages (id, room_id, sender_id, text, stance)
    VALUES (?, ?, ?, ?, ?)
  `);

  const seedTx = db.transaction(() => {
    // 1. Seed Topics
    const topics = [
      {
        id: 'topic-1',
        title: 'AI Layoffs vs Reality',
        category: 'Tech',
        debaterCount: 1420,
        heatScore: 98,
        matchRate: 94,
        isHot: 1,
        description: 'Are headcount cuts truly driven by AI productivity gains, or executive margin preservation?'
      },
      {
        id: 'topic-2',
        title: 'Office Politics & Ghost Promos',
        category: 'Workplace',
        debaterCount: 890,
        heatScore: 91,
        matchRate: 88,
        isHot: 1,
        description: 'Promised promotions postponed indefinitely while responsibilities multiply.'
      },
      {
        id: 'topic-3',
        title: 'Startup Chaos & Seed Valuations',
        category: 'Startups',
        debaterCount: 760,
        heatScore: 86,
        matchRate: 82,
        isHot: 0,
        description: 'Burn rates spiraling as AI wrapper startups face platform commoditization.'
      },
      {
        id: 'topic-4',
        title: 'The Death of Organic Dating in 2026',
        category: 'Social',
        debaterCount: 1240,
        heatScore: 95,
        matchRate: 91,
        isHot: 1,
        description: 'Curated profiles killed genuine spark. Why anonymous topic friction builds real bonds.'
      },
      {
        id: 'topic-5',
        title: 'Stealth Whistleblowing Culture',
        category: 'Spicy',
        debaterCount: 630,
        heatScore: 89,
        matchRate: 85,
        isHot: 0,
        description: 'How encrypted topic channels are replacing HR mediation across Tier-1 tech.'
      },
      {
        id: 'topic-6',
        title: 'Remote Work Surveillance Backlash',
        category: 'Workplace',
        debaterCount: 950,
        heatScore: 93,
        matchRate: 89,
        isHot: 1,
        description: 'Keystroke logging and biometric presence trackers triggering mass silent boycotts.'
      },
      {
        id: 'topic-7',
        title: 'Salary Transparency Wars',
        category: 'Workplace',
        debaterCount: 1120,
        heatScore: 92,
        matchRate: 87,
        isHot: 1,
        description: 'Anonymous payroll leaks disrupting retention across Indian tech corridors.'
      },
      {
        id: 'topic-8',
        title: 'Why People Ghost',
        category: 'Social',
        debaterCount: 1540,
        heatScore: 96,
        matchRate: 93,
        isHot: 1,
        description: 'Conflict avoidance vs algorithmic abundance mindset in modern courtship.'
      }
    ];

    for (const t of topics) {
      insertTopic.run(t.id, t.title, t.category, t.description, t.debaterCount, t.heatScore, t.matchRate, t.isHot, null);
    }

    // 2. Seed Peer Personas (Authentic Candidates for fresh browser matching)
    const seedCandidates = [
      {
        id: 'user-partner-1',
        email: 'elena.rostova@cipher.net',
        handle: 'cipher_vanguard',
        chaosIndex: 94,
        isVerified: 1,
        avatarSeed: 'cipher',
        age: 26,
        gender: 'Women',
        intent: 'Conversations & Dating',
        city: 'Gurgaon, NCR',
        lat: 28.4610,
        lng: 77.0280,
        role: 'Staff ML Infrastructure Engineer',
        tagline: 'Contrarian systems architect • AI safety cynic',
        realName: 'Elena Rostova',
        realPhoto: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500&auto=format&fit=crop&q=80',
        topics: ['topic-1', 'topic-2', 'topic-5', 'topic-8'],
        tags: ['OFFICE_POLITICS', 'CYBERNETICS', 'AI_WRAPPERS', 'STARTUP_DRAMA']
      },
      {
        id: 'user-partner-2',
        email: 'logic.gate@rumr.mesh',
        handle: 'logic_gate_99',
        chaosIndex: 88,
        isVerified: 1,
        avatarSeed: 'logic',
        age: 28,
        gender: 'Men',
        intent: 'Conversations & Dating',
        city: 'Delhi NCR',
        lat: 28.5355,
        lng: 77.3910,
        role: 'Principal Distributed Systems Lead',
        tagline: 'Building consensus protocols • Zero patience for small talk',
        realName: 'Kabir Mehta',
        realPhoto: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500&auto=format&fit=crop&q=80',
        topics: ['topic-2', 'topic-3', 'topic-7'],
        tags: ['DISTRIBUTED_SYSTEMS', 'SALARY_TRANSPARENCY', 'SEED_ROUNDS']
      },
      {
        id: 'user-partner-3',
        email: 'neo.contrarian@rumr.mesh',
        handle: 'neo_contrarian',
        chaosIndex: 86,
        isVerified: 1,
        avatarSeed: 'contrarian',
        age: 25,
        gender: 'Non-binary',
        intent: 'Conversations & Dating',
        city: 'Mumbai, MH',
        lat: 19.0760,
        lng: 72.8777,
        role: 'Quantitative Sociologist & Essayist',
        tagline: 'Analyzing platform mechanics and behavioral economics',
        realName: 'Aarav Sen',
        realPhoto: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=500&auto=format&fit=crop&q=80',
        topics: ['topic-4', 'topic-8', 'topic-1'],
        tags: ['ORGANIC_DATING', 'PLATFORM_FATIGUE', 'SOCIOLOGY']
      },
      {
        id: 'user-partner-4',
        email: 'quantum.phantom@rumr.mesh',
        handle: 'quantum_phantom',
        chaosIndex: 96,
        isVerified: 1,
        avatarSeed: 'quantum',
        age: 29,
        gender: 'Women',
        intent: 'Conversations & Dating',
        city: 'Bengaluru, KA',
        lat: 12.9716,
        lng: 77.5946,
        role: 'Autonomous Agent Architect',
        tagline: 'Vector space explorer • Building decentralized compute',
        realName: 'Priya Nambiar',
        realPhoto: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=500&auto=format&fit=crop&q=80',
        topics: ['topic-1', 'topic-3', 'topic-5', 'topic-7'],
        tags: ['AGENT_ARCHITECTURE', 'VENTURE_CAPITAL', 'STEALTH_COMMITS']
      }
    ];

    for (const c of seedCandidates) {
      insertUser.run(
        c.id, c.email, c.handle, c.chaosIndex, c.isVerified, c.avatarSeed,
        c.age, c.gender, c.intent, c.city, c.lat, c.lng, 'approximate',
        0, 50, c.role, c.tagline, c.realName, c.realPhoto, 0
      );

      for (const tid of c.topics) {
        insertUserTopic.run(c.id, tid);
      }

      for (let i = 0; i < c.tags.length; i++) {
        insertResonanceTag.run(`tag-${c.id}-${i}`, c.id, c.tags[i]);
      }
    }

    // 3. Seed Rumors
    const rumors = [
      {
        id: 'rumor-1',
        topicId: 'topic-1',
        authorId: 'user-partner-1',
        content: 'A tier-1 cloud provider quietly mandated all managers replace 20% of contractor headcount with LLM agents before Q4 review.',
        encryptedContent: 'A tier-1 cloud provider quietly mandated [REDACTED] to replace 20% of [ENCRYPTED_DEPARTMENT] with LLM orchestration by [DATE_LOCKED].',
        isEncrypted: 1,
        matchRate: 94,
        agrees: 342,
        debates: 89,
        tags: JSON.stringify(['#CLOUD_WARS', '#AGENT_REPLACEMENT', '#LEAK'])
      },
      {
        id: 'rumor-2',
        topicId: 'topic-2',
        authorId: 'user-partner-2',
        content: 'Leadership just froze all L6 promotions for the third quarter in a row, yet approved 4 external VP hires in the same week.',
        encryptedContent: 'Leadership just froze all [LEVEL_LOCKED] promos while [REDACTED_VP_COUNT] external hires were cleared in secret.',
        isEncrypted: 0,
        matchRate: 88,
        agrees: 512,
        debates: 144,
        tags: JSON.stringify(['#GHOST_PROMOS', '#INTERNAL_MOBILITY', '#UNFILTERED'])
      },
      {
        id: 'rumor-3',
        topicId: 'topic-4',
        authorId: 'user-partner-3',
        content: 'Matching on shared intellectual conflict has a 4.2x higher chat retention rate than photo-first swipe apps.',
        encryptedContent: 'Matching on [FRICTION_INDEX] yields 4.2x higher [RETENTION_METRIC] than swipe mechanics.',
        isEncrypted: 1,
        matchRate: 91,
        agrees: 289,
        debates: 67,
        tags: JSON.stringify(['#TOPIC_FIRST', '#FRICTION_MATCH', '#DATA'])
      },
      {
        id: 'rumor-4',
        topicId: 'topic-3',
        authorId: 'user-partner-4',
        content: 'Three YC W26 startups in our co-working hub just pivoted from autonomous agents back to vertical SaaS with human-in-the-loop.',
        encryptedContent: 'Three [BATCH_LOCKED] companies in [CITY_ENCRYPTED] pivoted away from full autonomy due to margin decay.',
        isEncrypted: 0,
        matchRate: 82,
        agrees: 420,
        debates: 115,
        tags: JSON.stringify(['#STARTUP_PIVOT', '#UNIT_ECONOMICS', '#FOUNDERS'])
      }
    ];

    for (const r of rumors) {
      insertRumor.run(r.id, r.topicId, r.authorId, r.content, r.encryptedContent, r.isEncrypted, r.matchRate, r.agrees, r.debates, r.tags);
    }

    // 4. Seed Live Audio Rooms
    const rooms = [
      {
        id: 'room-1',
        title: 'Startup Chaos // The 2026 Burn Rate Reckoning',
        category: 'Startups',
        hostId: 'user-partner-4',
        isLive: 1,
        isPrivate: 0,
        activeSpeakers: 3,
        listeners: 42,
        recentDebate: 'VCs are demanding 80% gross margins on agentic architectures.'
      },
      {
        id: 'room-2',
        title: 'Why People Ghost // Modern Courtship Breakdown',
        category: 'Social',
        hostId: 'user-partner-3',
        isLive: 1,
        isPrivate: 0,
        activeSpeakers: 2,
        listeners: 89,
        recentDebate: 'Is ghosting an unavoidable side-effect of dating app option paralysis?'
      },
      {
        id: 'room-3',
        title: 'AI Layoffs vs Cloud Infra Margin Squeeze',
        category: 'Tech',
        hostId: 'user-partner-1',
        isLive: 1,
        isPrivate: 0,
        activeSpeakers: 4,
        listeners: 134,
        recentDebate: 'Middle management is using LLMs as cover to offload contractor blame.'
      }
    ];

    for (const rm of rooms) {
      insertRoom.run(rm.id, rm.title, rm.category, rm.hostId, rm.isLive, rm.isPrivate, rm.activeSpeakers, rm.listeners, rm.recentDebate);
      
      insertRoomMessage.run(`rm-msg-${rm.id}-1`, rm.id, rm.hostId, 'Welcome everyone. This room is gated to users with verified interest in this domain.', null);
      insertRoomMessage.run(`rm-msg-${rm.id}-2`, rm.id, 'user-partner-2', 'The mainstream narrative ignores the underlying compute cost dynamics.', 'debate');
      insertRoomMessage.run(`rm-msg-${rm.id}-3`, rm.id, 'user-partner-3', 'Agreed. The real bottleneck is executive prioritization, not tooling.', 'agree');
    }
  });

  seedTx();
}
