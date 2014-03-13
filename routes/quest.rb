class Gamification < Sinatra::Application

  # Get all quests
  #
  # return [Array] quest objects
  get '/quest' do
    if authorized?
      content_type :json
      @quest = Quest.all()
      status 200
      return @quest.to_json
    else
      status 401
    end
  end

  # Get a quest by id
  #
  # param [String] the quest id
  #
  # return [Object] quest
  get '/quest/:id' do
    if authorized?
      content_type :json
      quest = Quest.find(params[:id])
      status 200
      return quest.to_json
    else
      status 401
    end
  end

  # Create a new quest
  #
  # return [Object] quest
  post '/quest' do
    if authorized?
      request.body.rewind  # in case someone already read it
      content_type :json

      quest = Quest.create()
      status 200
      return  quest.to_json
    else
      status 401
    end
  end

  # Update a quest by id
  #
  # param [String] the quest id
  #
  # body [Object] in JSON. ex: {"label":"<String>" }
  #
  # return [Object] quest
  put '/quest/:id' do
    if authorized?
      request.body.rewind  # in case someone already read it
      content_type :json

      quest = Quest.find(params[:id])

      if quest then
        data = JSON.parse request.body.read

        unless data['label'].nil?
          quest.update_attributes(:label => data['label'])
          quest.save
        end

        status 200

        return  quest.to_json
      else
        return {"error" => "Quest "+params[:id]+" not found"}.to_json
      end
    else
      status 401
    end
  end

  # Add a level to a quest by id
  #
  # param [String] the quest id
  #
  # param [String] the level id
  #
  # return [Object] quest
  put '/quest/:id/addlevel/:levelid' do
    if authorized?
      request.body.rewind  # in case someone already read it
      content_type :json

      quest = Quest.find(params[:id])

      if quest then

        begin
          level = Level.find(params[:levelid])
        end

        if level
          quest.levels << level
          quest.save
        else
          status 500
          return {"error" => "Level "+params[:levelid]+" not found"}.to_json
        end

        status 200

        return  quest.to_json
      else
        return {"error" => "Quest "+params[:id]+" not found"}.to_json
      end
    else
      status 401
    end
  end

  # Remove a level from a quest by id
  #
  # param [String] the quest id
  #
  # param [String] the level id
  #
  # return [Object] quest
  put '/quest/:id/removelevel/:levelid' do
    if authorized?
      request.body.rewind  # in case someone already read it
      content_type :json

      quest = Quest.find(params[:id])

      if quest then

        begin
          level = Level.find(params[:levelid])
        end

        if level
          quest.levels.delete(level)
          quest.save
        else
          status 500
          return {"error" => "Level "+params[:levelid]+" not found"}.to_json
        end

        status 200

        return  quest.to_json
      else
        return {"error" => "Quest "+params[:id]+" not found"}.to_json
      end
    else
      status 401
    end
  end

  # Add an assigned group to a quest by id
  #
  # param [String] the quest id
  #
  # param [String] the level id
  #
  # return [Object] quest
  put '/quest/:id/addassignedgroup/:groupid' do
    if authorized?
      request.body.rewind  # in case someone already read it
      content_type :json

      quest = Quest.find(params[:id])

      if quest then

        begin
          group = Group.find(params[:groupid])
        end

        if group
          quest.assignedgroups << params[:groupid]
          quest.save
        else
          status 500
          return {"error" => "Group "+params[:groupid]+" not found"}.to_json
        end

        status 200

        return  quest.to_json
      else
        return {"error" => "Quest "+params[:id]+" not found"}.to_json
      end
    else
      status 401
    end
  end

  # Remove an assigned group from a quest by id
  #
  # param [String] the quest id
  #
  # param [String] the group id
  #
  # return [Object] quest
  put '/quest/:id/removeassignedgroup/:groupid' do
    if authorized?
      request.body.rewind  # in case someone already read it
      content_type :json

      quest = Quest.find(params[:id])

      if quest then

        begin
          group = Group.find(params[:groupid])
        end

        if group
          quest.assignedgroups.delete(params[:groupid])
          quest.save
        else
          status 500
          return {"error" => "Group "+params[:groupid]+" not found"}.to_json
        end

        status 200

        return  quest.to_json
      else
        return {"error" => "Quest "+params[:id]+" not found"}.to_json
      end
    else
      status 401
    end
  end

  # Add a completed group to a quest by id
  #
  # param [String] the quest id
  #
  # body [Object] in JSON. ex: {"group_id":"<String>", "user_id":"<String>", "text":"<String>", "finished_on":"<String>" }
  #
  # return [Object] quest
  put '/quest/:id/addcompletedgroup' do
    if authorized?
      request.body.rewind  # in case someone already read it
      content_type :json

      quest = Quest.find(params[:id])

      if quest then
        data = JSON.parse request.body.read

        unless data.nil? or data['group_id'].nil? then

          if quest.assignedgroups.include?(data['group_id']) then

            completedobject = Completedobject.create(:text => data['text'], :user_id => data['user_id'], :group_id => data['group_id'], :finished_on => data['finished_on']);
            quest.completedobjects << completedobject
            quest.save
            status 200
            return  quest.to_json
          else
            status 500
            return {"error" => "Group "+data['group_id']+" not found"}.to_json
          end

        else
          status 500
          return {"error" => "Group id missing"}.to_json
        end
      else
        return {"error" => "Quest "+params[:id]+" not found"}.to_json
      end
    else
      status 401
    end
  end

  # Delete a quest by id
  #
  # param [String] the quest id
  #
  # return [Object] message
  delete '/quest/:id' do
    if authorized?
      request.body.rewind  # in case someone already read it
      content_type :json

      quest = Quest.find(params[:id])

      if quest.levels.empty? then
        if quest.destroy then
          status 200
          return {"message" => "Quest "+params[:id]+" deleted"}.to_json
        else
          status 500
          return {"error" => "Quest "+params[:id]+" not deleted"}.to_json
        end
      else
        status 401
        return {"error" => "This quest has completed levels. Delete those first before deleting this quest."}.to_json
      end
    else
      status 401
      return {"error" => "Not authorised"}.to_json
    end
  end
end