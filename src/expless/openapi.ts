const openapiSchema = {
  openapi: '3.0.3',
  info: {
    title: 'kanaban-friends-api',
    version: '1.0.0',
  },
  servers: [
    {
      url: 'http://localhost:3000/v1',
    },
  ],

  paths: {
    '/hand': {
      get: {
        summary: 'Get hand',
        operationId: 'getHand',
        parameters: [
          {
            name: 'userToken',
            in: 'query',
            schema: {type: 'string'},
            style: 'form',
            required: true,
          },
          {
            name: 'handId',
            in: 'query',
            schema: {type: 'string'},
            style: 'form',
          },
          {
            name: 'isChildren',
            in: 'query',
            schema: {type: 'boolean'},
            style: 'form',
          }
        ],
        responses: {
          '200': {
            description: 'OK',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Hand',
                },
              },
            },
          },
        },
      },
    },
    'hand/create':{
      post: {
        summary: 'Create hand',
        operationId: 'createHand',
        requestBody: {
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/CreateHand',
              },
            },
          },
        },
        responses: {
          '200': {
            description: 'OK',
          },
        },
      },
    },
    'hand/update':{
      post: {
        summary: 'Update hand',
        operationId: 'updateHand',
        requestBody: {
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/UpdateHand',
              },
            },
          },
        },
        responses: {
          '200': {
            description: 'OK',
          },
        },
      },
    },
    'hand/delete':{
      delete: {
        summary: 'Delete hand',
        operationId: 'deleteHand',
        requestBody: {
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/deleteHand',
              },
            },
          },
        },
        responses: {
          '200': {
            description: 'OK',
          },
        },
      },
    },
  },
  // "card": {}
  components: {
    schemas: {
      Hand: {
        type: 'object',
        properties: {
          id: {
            type: 'integer',
          },
          type: {
            type: 'string',
          },
          value: {
            type: 'string',
          },
          children: {
            type: 'array',
            items: {
              $ref: '#/components/schemas/Hand',
            },
          },
        },
      },
      CreateHand: {
        type: 'object',
        required: ['type', 'value', 'parent'],
        properties: {
          type: {
            type: 'string',
          },
          value: {
            type: 'string',
          },
          parent: {
            type: 'integer',
          }
        },
      },
      UpdateHand: {
        type: 'object',
        required: ['id'],
        properties: {
          id: {
            type: 'integer',
          },
          value: {
            type: 'string',
          },
          parentTo: {
            type: 'integer',
          },
          parentToPos: {
            type: 'integer',
          },
        },
      },
      DeleteHand: {
        type: 'object',
        required: ['id'],
        properties: {
          id: {
            type: 'integer',
          },
        },
      },
    },
  },
}

export default openapiSchema;