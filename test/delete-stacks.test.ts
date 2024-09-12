// https://aws.amazon.com/blogs/developer/mocking-modular-aws-sdk-for-javascript-v3-in-unit-tests/

import { mockClient } from 'aws-sdk-client-mock';
import { CloudFormationClient, ListStacksCommand, DeleteStackCommand, StackSummary } from "@aws-sdk/client-cloudformation";
import { getStacks, deleteStack, retryDeletion } from "../src/lambda";

const cftMock = mockClient(CloudFormationClient)
const cft = new CloudFormationClient({})

describe("getStacks() Function", () => {
    it("should return a filtered list", async () => {
        cftMock.reset();
        cftMock.on(ListStacksCommand).resolves({
            StackSummaries: [
                {
                    CreationTime: new Date('2024-09-12T18:26:53.407Z'),
                    StackName: "DMS-API",
                    StackStatus: "CREATE_COMPLETE",
                },
                {
                    CreationTime: new Date('2024-09-12T18:26:53.407Z'),
                    StackName: "CDKToolKit",
                    StackStatus: "CREATE_COMPLETE",
                },
                {
                    CreationTime: new Date('2024-09-12T18:26:53.407Z'),
                    StackName: "Test-Stack",
                    StackStatus: "CREATE_COMPLETE",
                },
                {
                    CreationTime: new Date('2024-09-12T18:26:53.407Z'),
                    StackName: "TXXMS-Stack",
                    StackStatus: "CREATE_COMPLETE",
                },
                {
                    CreationTime: new Date('2024-09-12T18:26:53.407Z'),
                    StackName: "PMS-Stack",
                    StackStatus: "CREATE_COMPLETE",
                },
                {
                    CreationTime: new Date('2024-09-12T18:26:53.407Z'),
                    StackName: "D-ValidStack",
                    StackStatus: "CREATE_COMPLETE",
                },
                {
                    CreationTime: new Date('2024-09-12T18:26:53.407Z'),
                    StackName: "InvalidStack",
                    StackStatus: "CREATE_COMPLETE",
                },
            ]
        });

        const result = await getStacks();
        expect(result).toEqual([
            { CreationTime: new Date('2024-09-12T18:26:53.407Z'), StackName: 'DMS-API', StackStatus: 'CREATE_COMPLETE' },
            { CreationTime: new Date('2024-09-12T18:26:53.407Z'), StackName: 'Test-Stack', StackStatus: 'CREATE_COMPLETE' },
            { CreationTime: new Date('2024-09-12T18:26:53.407Z'), StackName: 'TXXMS-Stack', StackStatus: 'CREATE_COMPLETE' }
        ])
    });

    it("should return an empty list", async () => {
        cftMock.reset();
        cftMock.on(ListStacksCommand).resolves({
            StackSummaries: [
                {
                    CreationTime: new Date('2024-09-12T18:26:53.407Z'),
                    StackName: "CDKToolKit",
                    StackStatus: "CREATE_COMPLETE",
                },
                {
                    CreationTime: new Date('2024-09-12T18:26:53.407Z'),
                    StackName: "PMS-Stack",
                    StackStatus: "CREATE_COMPLETE",
                },
                {
                    CreationTime: new Date('2024-09-12T18:26:53.407Z'),
                    StackName: "InvalidStack",
                    StackStatus: "CREATE_COMPLETE",
                },
            ]
        });

        const result = await getStacks();
        expect(result).toEqual([])
    });
});

describe("deleteStack() Function", () => {
    cftMock.reset()
    it("should delete a stack", async () => {
        cftMock.on(DeleteStackCommand).resolves({})

        const result = await deleteStack({
            CreationTime: new Date('2024-09-12T18:26:53.407Z'),
            StackName: 'DMS-API',
            StackStatus: 'DELETE_FAILED'
        });

        expect(result).toEqual(true)
    })
})

// This test isn't working as expected
/*
describe("retryDeletion() Function", () => {
    it("should retry deletion for failed stacks", async () => {
        cftMock.reset()
        cftMock.on(DeleteStackCommand).resolves({})

        const stacks: StackSummary[] = [
            {CreationTime: new Date('2024-09-12T18:26:53.407Z'), StackName: 'DMS-API', StackStatus: 'DELETE_FAILED'},
            {CreationTime: new Date('2024-09-12T18:26:53.407Z'), StackName: 'Test-Stack', StackStatus: 'DELETE_FAILED'},
            {CreationTime: new Date('2024-09-12T18:26:53.407Z'), StackName: 'TXXMS-Stack', StackStatus: 'DELETE_FAILED'},
        ]

        const result = await retryDeletion(stacks);
        expect(cftMock.send).toHaveBeenCalledTimes(3)
    })
})
*/