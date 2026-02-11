#[test_only]
module engram::core_tests {
    use sui::test_scenario;
    use sui::clock::{Self};
    use std::string;
    use std::option;
    use engram::core::{Self, HiveState, Construct};

    // Test addresses
    const ALICE: address = @0xA;
    const BOB: address = @0xB;

    #[test]
    fun test_end_to_end_flow() {
        let mut scenario = test_scenario::begin(ALICE);
        let clock = clock::create_for_testing(test_scenario::ctx(&mut scenario));

        // 1. Init
        core::init_for_testing(test_scenario::ctx(&mut scenario));
        test_scenario::next_tx(&mut scenario, ALICE);

        // 2. Alice Jack In
        {
            let mut hive = test_scenario::take_shared<HiveState>(&scenario);
            core::jack_in(&mut hive, &clock, test_scenario::ctx(&mut scenario));
            test_scenario::return_shared(hive);
        };
        test_scenario::next_tx(&mut scenario, ALICE);

        // 3. Alice Engraves a Memory
        {
            let mut hive = test_scenario::take_shared<HiveState>(&scenario);
            let mut construct = test_scenario::take_shared<Construct>(&scenario);
            
            // Verify ownership logic (simulated)
            // Construct is shared, but we can access it
            
            core::engrave(
                &mut construct,
                &mut hive,
                &clock,
                string::utf8(b"Hello World"),
                50, // emotion
                1, // category
                false, // is_encrypted
                option::none(), // blob_id
                option::none(), // media_type
                test_scenario::ctx(&mut scenario)
            );

            test_scenario::return_shared(hive);
            test_scenario::return_shared(construct);
        };
        test_scenario::next_tx(&mut scenario, ALICE);

        // 4. Verify Escape Pod (Set Backup)
        {
            let mut construct = test_scenario::take_shared<Construct>(&scenario);
            core::set_backup_controller(&mut construct, BOB, test_scenario::ctx(&mut scenario));
            test_scenario::return_shared(construct);
        };
        test_scenario::next_tx(&mut scenario, BOB);

        // 5. Emergency Recover (Bob takes over)
        {
            let mut construct = test_scenario::take_shared<Construct>(&scenario);
            // Bob calls recover
            core::emergency_recover(&mut construct, &clock, test_scenario::ctx(&mut scenario));
            test_scenario::return_shared(construct);
        };
        
        // Clean up
        clock::destroy_for_testing(clock);
        test_scenario::end(scenario);
    }
}
