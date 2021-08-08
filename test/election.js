var Election = artifacts.require("./Election.sol");

contract("Election", async function(accounts) {
  var instance;
  var electionInstance;

  it("initializes with two candidates", async function() {
    var instance = await Election.deployed();
    var count = await instance.candidatesCount();
    assert.equal(count, 2);
  });

  it("it initializes the candidates with the correct values", async function() {
    var instance = await Election.deployed();
    electionInstance = instance;

    var candidate = await electionInstance.candidates(1);
    assert.equal(candidate[0], 1, "contains the correct id");
    assert.equal(candidate[1], "Candidate 1", "contains the correct name");
    assert.equal(candidate[2], 0, "contains the correct votes count");

    candidate = await electionInstance.candidates(2);
    assert.equal(candidate[0], 2, "contains the correct id");
    assert.equal(candidate[1], "Candidate 2", "contains the correct name");
    assert.equal(candidate[2], 0, "contains the correct votes count");
  });

  it("allows a voter to cast a vote", async function() {
    var electionInstance = await Election.deployed();
    var candidateId = 1;
    var receipt = await electionInstance.vote(candidateId, { from: accounts[0] });
    assert.equal(receipt.logs.length, 1, "an event was triggered");
    assert.equal(receipt.logs[0].event, "votedEvent", "the event type is correct");
    assert.equal(receipt.logs[0].args._candidateId.toNumber(), candidateId, "the candidate id is correct");
    var voted = await electionInstance.hasVoted(accounts[0]);
    assert(voted, "the voter was marked as voted");
    var candidate = await electionInstance.candidates(candidateId);
    var voteCount = candidate[2];
    assert.equal(voteCount, 1, "increments the candidate's vote count");
  });

  it("throws an exception for invalid candidates", function() {
    return Election.deployed().then(function(instance) {
      electionInstance = instance;
      return electionInstance.vote(99, { from: accounts[1] })
    }).then(assert.fail).catch(function(error) { // TODO learn how to catch error using async. Leaving chain for now.
      assert(error.message.indexOf('revert') >= 0, "error message must contain revert");
      return electionInstance.candidates(1);
    }).then(function(candidate1) {
      var voteCount = candidate1[2];
      assert.equal(voteCount, 1, "candidate 1 did not receive any votes");
      return electionInstance.candidates(2);
    }).then(function(candidate2) {
      var voteCount = candidate2[2];
      assert.equal(voteCount, 0, "candidate 2 did not receive any votes");
    });
  });

  it("throws an exception for double voting", async function() {
    return Election.deployed().then(async function(instance) {
      electionInstance = instance;
      candidateId = 2;
      await electionInstance.vote(candidateId, { from: accounts[1] });
      return electionInstance.candidates(candidateId);
    }).then(function(candidate) {
      var voteCount = candidate[2];
      assert.equal(voteCount, 1, "accepts first vote");
      // Try to vote again
      return electionInstance.vote(candidateId, { from: accounts[1] });
    }).then(assert.fail).catch(function(error) { // TODO learn how to catch error using async. Leaving chain for now.
      assert(error.message.indexOf('revert') >= 0, "error message must contain revert");
      return electionInstance.candidates(1);
    }).then(function(candidate1) {
      var voteCount = candidate1[2];
      assert.equal(voteCount, 1, "candidate 1 did not receive any votes");
      return electionInstance.candidates(2);
    }).then(function(candidate2) {
      var voteCount = candidate2[2];
      assert.equal(voteCount, 1, "candidate 2 did not receive any votes");
    });
  });

  
});
