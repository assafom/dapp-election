pragma solidity 0.5.0;

contract Election {

    struct Candidate {
        uint id;
        string name;
        uint voteCount;
        address donations;
    }

    event votedEvent (
        uint indexed _candidateId
    );

    mapping(uint => Candidate) public candidates;
    
    mapping(address => bool) public hasVoted;


    uint public candidatesCount;

    constructor() public {
        candidatesCount = 0;
        addCandidate("Candi 1", 0x46b29B1F249D79C8634fbfA18fda9209fd4D0303);
        addCandidate("Candi 2", 0x84D4477a1Aa1303EE8449283a6ac77EaA206b084);
    }

    function vote(uint _candidateId) public {
        require(!hasVoted[msg.sender]);
        require(_candidateId > 0 && _candidateId <= candidatesCount);
        hasVoted[msg.sender] = true;
        candidates[_candidateId].voteCount ++;
        emit votedEvent(_candidateId);
    }

    function addCandidate (string memory _name, address _addr) private {
        candidatesCount++;
        candidates[candidatesCount] = Candidate(candidatesCount, _name, 0, _addr);
    }    
}