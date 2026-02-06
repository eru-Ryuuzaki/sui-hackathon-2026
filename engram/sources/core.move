module engram::core {
    use std::string::{Self, String};
    use std::option::{Self, Option};
    use sui::object::{Self, UID};
    use sui::transfer;
    use sui::tx_context::{Self, TxContext};
    use sui::clock::{Self, Clock};
    use sui::dynamic_field;
    use sui::dynamic_object_field;
    use sui::event;

    // ================= Errors =================
    const ELengthExceeded: u64 = 0;
    const EInsufficientEnergy: u64 = 1;
    const ENotAuthorized: u64 = 2;
    const ENoBackupSet: u64 = 3;

    // ================= Constants =================
    const MAX_SHARD_LENGTH: u64 = 1000;
    const BASE_EXP_REWARD: u64 = 10;
    const ENERGY_COST_PER_SHARD: u64 = 5;

    // ================= Structs =================

    /// Global State for "Hive Mind" statistics
    /// Optimized: Only stores counters. No vectors.
    public struct HiveState has key {
        id: UID,
        total_subjects: u64,
        total_shards: u64,
        total_badges_issued: u64,
    }

    /// The User's Soul (Construct)
    /// DESIGN CHANGE: This is a SHARED OBJECT.
    /// Why? To enable "Escape Pod" (Emergency Recovery). 
    /// If it were owned by a banned Google account, no one (not even backup) could touch it.
    /// As a Shared Object, the Backup Controller can initiate a transaction to claim it.
    public struct Construct has key, store {
        id: UID,
        owner: address,           // The current "consciousness" (User Address)
        backup_controller: Option<address>, // The "Escape Pod" key
        level: u64,
        exp: u64,
        vital_metrics: Metrics,
        shard_count: u64,
    }

    /// Embedded struct for metrics
    public struct Metrics has store, drop, copy {
        energy: u64,        
        focus: u8,          
        resilience: u8,     
        last_update: u64,   
    }

    /// The Memory Shard (Stored as Dynamic Field)
    public struct MemoryShard has store, drop, copy {
        timestamp: u64,
        content: String,
        emotion_val: i8,    
        category: u8,
        is_encrypted: bool, // PRIVACY FEATURE
    }

    /// Neural Badge (Achievement NFT)
    public struct NeuralBadge has key, store {
        id: UID,
        name: String,
        description: String,
        rarity: u8,
        unlocked_at: u64,
    }

    // ================= Events (The Hive Mind Stream) =================

    /// Primary source for the "Matrix Rain" visual effect.
    /// Permanent history, cheap gas, no contention.
    public struct ShardEngravedEvent has copy, drop {
        subject: address,
        construct_id: ID,
        shard_id: u64,
        timestamp: u64,
        category: u8,
        is_encrypted: bool,
        // We emit the content (or hash) here. 
        // If encrypted, this is ciphertext.
        content_snippet: String, 
    }

    public struct SubjectJackedInEvent has copy, drop {
        subject: address,
        construct_id: ID,
        timestamp: u64,
    }

    public struct EmergencyRecoveryEvent has copy, drop {
        construct_id: ID,
        old_owner: address,
        new_owner: address,
        timestamp: u64,
    }

    // ================= Public Functions =================

    fun init(ctx: &mut TxContext) {
        let hive = HiveState {
            id: object::new(ctx),
            total_subjects: 0,
            total_shards: 0,
            total_badges_issued: 0,
        };
        transfer::share_object(hive);
    }

    /// 3.1 Jack In: Create the Construct
    public entry fun jack_in(
        hive: &mut HiveState,
        clock: &Clock,
        ctx: &mut TxContext
    ) {
        let sender = tx_context::sender(ctx);
        
        let metrics = Metrics {
            energy: 100,
            focus: 50,
            resilience: 50,
            last_update: clock::timestamp_ms(clock),
        };

        let id = object::new(ctx);
        let construct_id = object::uid_to_inner(&id);

        let construct = Construct {
            id,
            owner: sender,
            backup_controller: option::none(),
            level: 1,
            exp: 0,
            vital_metrics: metrics,
            shard_count: 0,
        };

        // Update Global Stats
        hive.total_subjects = hive.total_subjects + 1;

        event::emit(SubjectJackedInEvent {
            subject: sender,
            construct_id,
            timestamp: clock::timestamp_ms(clock),
        });

        // Share the object so it can be recovered later
        transfer::share_object(construct);
    }

    /// 3.2 Engrave: Record a Memory Shard
    public entry fun engrave(
        construct: &mut Construct,
        hive: &mut HiveState,
        clock: &Clock,
        content: String,
        emotion_val: i8,
        category: u8,
        is_encrypted: bool,
        ctx: &mut TxContext
    ) {
        let sender = tx_context::sender(ctx);
        // Authorization: Only the owner can engrave
        assert!(construct.owner == sender, ENotAuthorized);
        
        // Validation
        assert!(string::length(&content) <= MAX_SHARD_LENGTH, ELengthExceeded);
        assert!(construct.vital_metrics.energy >= ENERGY_COST_PER_SHARD, EInsufficientEnergy);

        // Mint Shard
        let timestamp = clock::timestamp_ms(clock);
        let shard = MemoryShard {
            timestamp,
            content: content, 
            emotion_val,
            category,
            is_encrypted,
        };

        // Attach as Dynamic Field
        dynamic_field::add(&mut construct.id, construct.shard_count, shard);

        // Update Construct State
        construct.shard_count = construct.shard_count + 1;
        construct.exp = construct.exp + BASE_EXP_REWARD;
        construct.vital_metrics.energy = construct.vital_metrics.energy - ENERGY_COST_PER_SHARD;
        construct.vital_metrics.last_update = timestamp;

        // Update Global Hive State
        hive.total_shards = hive.total_shards + 1;

        // Emit Event
        event::emit(ShardEngravedEvent {
            subject: sender,
            construct_id: object::uid_to_inner(&construct.id),
            shard_id: construct.shard_count - 1,
            timestamp,
            category,
            is_encrypted,
            content_snippet: if (is_encrypted) { string::utf8(b"[ENCRYPTED]") } else { content },
        });

        check_and_mint_badge(construct, hive, ctx);
    }

    /// Set the Escape Pod (Backup Controller)
    public entry fun set_backup_controller(
        construct: &mut Construct,
        new_backup: address,
        ctx: &mut TxContext
    ) {
        assert!(construct.owner == tx_context::sender(ctx), ENotAuthorized);
        construct.backup_controller = option::some(new_backup);
    }

    /// The Escape Pod Activation: Emergency Recovery
    /// If Google bans the user, the backup controller calls this to take over.
    public entry fun emergency_recover(
        construct: &mut Construct,
        clock: &Clock,
        ctx: &mut TxContext
    ) {
        let sender = tx_context::sender(ctx);
        assert!(option::is_some(&construct.backup_controller), ENoBackupSet);
        assert!(option::borrow(&construct.backup_controller) == &sender, ENotAuthorized);

        let old_owner = construct.owner;
        construct.owner = sender; // The backup becomes the new master

        // Optional: clear the backup slot or keep it? 
        // Let's keep it, or the new owner can set a new one.

        event::emit(EmergencyRecoveryEvent {
            construct_id: object::uid_to_inner(&construct.id),
            old_owner,
            new_owner: sender,
            timestamp: clock::timestamp_ms(clock),
        });
    }

    /// Internal function to handle achievements
    fun check_and_mint_badge(
        construct: &mut Construct,
        hive: &mut HiveState,
        ctx: &mut TxContext
    ) {
        // Badge 1: First Awakening
        if (construct.shard_count == 1) {
            let badge_key = string::utf8(b"badge_first_awakening");
            if (!dynamic_object_field::exists_(&construct.id, badge_key)) {
                 let badge = NeuralBadge {
                    id: object::new(ctx),
                    name: string::utf8(b"First Awakening"),
                    description: string::utf8(b"Recorded the first memory."),
                    rarity: 1,
                    unlocked_at: 0, 
                 };
                 dynamic_object_field::add(&mut construct.id, badge_key, badge);
                 hive.total_badges_issued = hive.total_badges_issued + 1;
            } 
        }
    }
}
