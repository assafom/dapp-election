pragma solidity 0.4.22;

contract Election {

    struct Candidate {
        uint id;
        string name;
        uint voteCount;
    }

    mapping(uint => Candidate) public candidates;

    uint public candidatesCount;

    function addCandidate (string _name) private {
        candidates[candidatesCount] = Candidate(candidatesCount, _name, 0);
        candidatesCount++;
    }

    // Constructor
    function Election () public {
        candidatesCount = 0;
        addCandidate("Candi 1");
        addCandidate("Candi 2");
    }
}