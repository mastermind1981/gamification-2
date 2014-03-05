class Gamification < Sinatra::Application

  # Get all classrooms
  #
  # return [Array] classroom objects
  get '/classroom' do
    if authorized?
      content_type :json
      @classroom = Classroom.all()
      status 200
      return @classroom.to_json
    else
      status 401
    end
  end

  # Get a classroom by id
  #
  # param [String] the classroom id
  #
  # return [Object] classroom
  get '/classroom/:id' do
    if authorized?
      content_type :json
      classroom = Classroom.find(params[:id])
      status 200
      return classroom.to_json
    else
      status 401
    end
  end

  # Create a new classroom
  #
  # return [Object] classroom
  post '/classroom' do
    if authorized?
      request.body.rewind  # in case someone already read it
      content_type :json

      classroom = Classroom.create()
      status 200
      return  classroom.to_json
    else
      status 401
    end
  end

  # Update a classroom by id
  #
  # param [String] the classroom id
  #
  # body [Object] in JSON. ex: {"label":"LABEL", "group_id":"GROUPID" }
  #
  # return [Object] classroom
  put '/classroom/:id' do
    if authorized?
      request.body.rewind  # in case someone already read it
      content_type :json

      classroom = Classroom.find(params[:id])

      if classroom then
        data = JSON.parse request.body.read

        unless data['label'].nil?
          classroom.update_attributes(:label => data['label'])
          classroom.save
        end

        unless data['group_id'].nil? then
          begin
            group = Group.find(data['group_id'])
          end

          if group
            classroom.groups << group
          else
            status 500
            return {"error" => "Group "+data['group_id']+" not found"}.to_json
          end
        end

        status 200

        return  classroom.to_json
      else
        return {"error" => "Classroom "+params[:id]+" not found"}.to_json
      end
    else
      status 401
    end
  end


  # Delete a classroom by id
  #
  # param [String] the classroom id
  #
  # return [Object] message
  delete '/classroom/:id' do
    if authorized?
      request.body.rewind  # in case someone already read it
      content_type :json

      classroom = Classroom.find(params[:id])

      if classroom.destroy then
        status 200
        return {"message" => "Classroom "+params[:id]+" deleted"}.to_json
      else
        status 500
        return {"error" => "Classroom "+params[:id]+" not deleted"}.to_json
      end
    else
      status 401
      return {"error" => "Not authorised"}.to_json
    end
  end
end
