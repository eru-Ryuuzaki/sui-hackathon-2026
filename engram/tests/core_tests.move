#[test_only]
module engram::core_tests {
    use sui::test_scenario;
    use sui::clock::{Self};
    use engram::core::{Self, HiveState, Construct};

    // Test addresses
    const ALICE: address = @0xA;
    const BOB: address = @0xB;

    #[test]
    fun test_end_to_end_flow() {
        let mut scenario = test_scenario::begin(ALICE);
        let clock = clock::create_for_testing(scenario.ctx());

        // 1. Init
        core::init_for_testing(scenario.ctx());
        scenario.next_tx(ALICE);

        // 2. Alice Jack In
        {
            let mut hive = scenario.take_shared<HiveState>();
            core::jack_in(&mut hive, &clock, scenario.ctx());
            test_scenario::return_shared(hive);
        };
        scenario.next_tx(ALICE);

        // 3. Alice Engraves a Memory
        {
            let mut hive = scenario.take_shared<HiveState>();
            let mut construct = scenario.take_shared<Construct>();
            
            // Verify ownership logic (simulated)
            // Construct is shared, but we can access it
            
            core::engrave(
                &mut construct,
                &mut hive,
                &clock,
                b"Hello World".to_string(),
                50, // emotion
                1, // category
                false, // is_encrypted
                option::none(), // blob_id
                option::none(), // media_type
                scenario.ctx()
            );

            test_scenario::return_shared(hive);
            test_scenario::return_shared(construct);
        };
        scenario.next_tx(ALICE);

        // 4. Verify Escape Pod (Set Backup)
        {
            let mut construct = scenario.take_shared<Construct>();
            core::set_backup_controller(&mut construct, BOB, scenario.ctx());
            test_scenario::return_shared(construct);
        };
        scenario.next_tx(BOB);

        // 5. Emergency Recover (Bob takes over)
        {
            let mut construct = scenario.take_shared<Construct>();
            // Bob calls recover
            core::emergency_recover(&mut construct, &clock, scenario.ctx());
            test_scenario::return_shared(construct);
        };
        
        // Clean up
        clock.destroy_for_testing();
        scenario.end();
    }
}
